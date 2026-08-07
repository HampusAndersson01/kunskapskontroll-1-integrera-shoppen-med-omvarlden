import fs from "node:fs";
import path from "node:path";

const DUMMYJSON_PRODUCTS_URL = "https://dummyjson.com/products?limit=100";
const ROOT_DIR = process.cwd();

loadEnvFile(path.join(ROOT_DIR, ".env"));
loadEnvFile(path.join(ROOT_DIR, ".env.local"));

const options = {
  dryRun: process.argv.includes("--dry-run"),
};

const supabaseUrl = readRequiredEnv("SUPABASE_URL", options.dryRun);
const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY", options.dryRun);

const productsResponse = await fetch(DUMMYJSON_PRODUCTS_URL);

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
  console.log("Dry run complete. No data was written to Supabase.");
  console.log("Sample category:", categories[0]);
  console.log("Sample product:", sampleProduct);
  process.exit(0);
}

const importedCategories = await upsertRows("categories", categories, "slug");
const categoryIdsBySlug = new Map(importedCategories.map((category) => [category.slug, category.id]));

const mappedProducts = products.map((product) => {
  const categorySlug = slugify(product.category);
  const categoryId = categoryIdsBySlug.get(categorySlug);

  if (!categoryId) {
    throw new Error(`Missing category id for ${categorySlug}.`);
  }

  return mapProduct(product, categoryId);
});

const importedProducts = await upsertRows("products", mappedProducts, "external_id");

console.log(`Imported ${importedCategories.length} categories.`);
console.log(`Imported ${importedProducts.length} products.`);

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

async function upsertRows(table, rows, conflictColumn) {
  const endpoint = new URL(`/rest/v1/${table}`, supabaseUrl);
  endpoint.searchParams.set("on_conflict", conflictColumn);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase ${table} upsert failed with ${response.status}: ${errorBody}`);
  }

  return response.json();
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
