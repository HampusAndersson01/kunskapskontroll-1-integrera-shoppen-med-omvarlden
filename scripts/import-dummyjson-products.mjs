import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const DUMMYJSON_PRODUCTS_URL = "https://dummyjson.com/products?limit=100";
const ROOT_DIR = process.cwd();

loadEnvFile(path.join(ROOT_DIR, ".env"));
loadEnvFile(path.join(ROOT_DIR, ".env.local"));

const options = {
  dryRun: process.argv.includes("--dry-run"),
};

const pool = options.dryRun ? null : createPool();

const productsResponse = await fetch(DUMMYJSON_PRODUCTS_URL, { signal: AbortSignal.timeout(10000) });

if (!productsResponse.ok) {
  throw new Error(`DummyJSON request failed with ${productsResponse.status}.`);
}

const productsPayload = await productsResponse.json();
const products = validateDummyJsonProducts(productsPayload);
const categories = mapCategories(products);

console.log(`Fetched ${products.length} products from DummyJSON.`);
console.log(`Mapped ${categories.length} categories.`);

if (options.dryRun) {
  const sampleProduct = mapProduct(products[0], "dry-run-category-id");
  console.log("Dry run complete. No data was written to PostgreSQL.");
  console.log("Sample category:", categories[0]);
  console.log("Sample product:", sampleProduct);
  process.exit(0);
}

try {
  const importedCategories = await upsertCategories(categories);
  const categoryIdsBySlug = new Map(importedCategories.map((category) => [category.slug, category.id]));
  const mappedProducts = products.map((product) => {
    const categoryId = categoryIdsBySlug.get(slugify(product.category));
    if (!categoryId) throw new Error(`Missing category id for ${product.category}.`);
    return mapProduct(product, categoryId);
  });
  await upsertProducts(mappedProducts);
  console.log(`Imported ${importedCategories.length} categories.`);
  console.log(`Imported ${mappedProducts.length} products.`);
} finally {
  await pool.end();
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function readRequiredEnv(name, allowMissing) {
  const value = process.env[name];

  if (!value && !allowMissing) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateDummyJsonProducts(payload) {
  if (!payload || !Array.isArray(payload.products)) {
    throw new Error("Unexpected DummyJSON response shape.");
  }

  return payload.products.map((product) => {
    if (
      typeof product.id !== "number" ||
      typeof product.title !== "string" ||
      typeof product.category !== "string" ||
      typeof product.price !== "number" ||
      typeof product.stock !== "number"
    ) {
      throw new Error("DummyJSON product is missing required fields.");
    }

    return product;
  });
}

function mapCategories(products) {
  const categoriesBySlug = new Map();

  for (const product of products) {
    const slug = slugify(product.category);

    if (!categoriesBySlug.has(slug)) {
      categoriesBySlug.set(slug, {
        name: titleCase(product.category),
        slug,
      });
    }
  }

  return [...categoriesBySlug.values()];
}

function mapProduct(product, categoryId) {
  return {
    external_id: product.id,
    category_id: categoryId,
    name: product.title,
    description: product.description ?? "",
    price: product.price,
    discount_percentage: product.discountPercentage ?? 0,
    rating: product.rating ?? null,
    stock: product.stock,
    brand: product.brand ?? null,
    sku: product.sku || `dummyjson-${product.id}`,
    image_url: product.thumbnail ?? product.images?.[0] ?? null,
    is_active: true,
  };
}

function createPool() {
  const { Pool } = pg;
  if (process.env.DATABASE_URL) return new Pool({ connectionString: process.env.DATABASE_URL });
  return new Pool({
    host: process.env.PGHOST ?? "localhost",
    port: Number(process.env.PGPORT ?? process.env.DB_PORT ?? 5432),
    database: process.env.PGDATABASE ?? readRequiredEnv("POSTGRES_DB", false),
    user: process.env.PGUSER ?? readRequiredEnv("POSTGRES_USER", false),
    password: process.env.PGPASSWORD ?? readRequiredEnv("POSTGRES_PASSWORD", false),
  });
}

async function upsertCategories(rows) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const saved = [];
    for (const row of rows) {
      const result = await client.query(
        `insert into categories (name,slug) values ($1,$2)
         on conflict (slug) do update set name=excluded.name,updated_at=now()
         returning id,name,slug`,
        [row.name, row.slug],
      );
      saved.push(result.rows[0]);
    }
    await client.query("commit");
    return saved;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

async function upsertProducts(rows) {
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const row of rows) {
      await client.query(
        `insert into products (external_id,category_id,name,description,price,discount_percentage,rating,
         stock,brand,sku,image_url,is_active) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         on conflict (external_id) do update set category_id=excluded.category_id,name=excluded.name,
         description=excluded.description,price=excluded.price,discount_percentage=excluded.discount_percentage,
         rating=excluded.rating,stock=excluded.stock,brand=excluded.brand,sku=excluded.sku,
         image_url=excluded.image_url,is_active=excluded.is_active,updated_at=now()`,
        [row.external_id,row.category_id,row.name,row.description,row.price,row.discount_percentage,row.rating,
          row.stock,row.brand,row.sku,row.image_url,row.is_active],
      );
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
