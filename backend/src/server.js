import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import connectPgSimple from "connect-pg-simple";
import cors from "cors";
import express from "express";
import session from "express-session";
import { pool } from "./db/pool.js";

const scrypt = promisify(scryptCallback);
const app = express();
const port = Number(process.env.PORT ?? 3000);
const isProduction = process.env.NODE_ENV === "production";
const secureCookie = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : isProduction;
const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set in production.");
}

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS."));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

const PgSession = connectPgSimple(session);
app.use(
  session({
    name: "shop.sid",
    store: new PgSession({ pool, createTableIfMissing: true }),
    secret: process.env.SESSION_SECRET ?? (isProduction ? undefined : "local-development-session-secret-change-me"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
);

app.get("/api/health", async (_request, response) => {
  try {
    await pool.query("select 1");
    response.json({ status: "ok" });
  } catch {
    response.status(503).json({ error: "Database unavailable." });
  }
});

app.post("/api/auth/register", async (request, response, next) => {
  try {
    const email = normalizeEmail(request.body?.email);
    const password = request.body?.password;
    if (!isValidEmail(email) || typeof password !== "string" || password.length < 6 || password.length > 200) {
      return response.status(400).json({ error: "Enter a valid email and a password with at least 6 characters." });
    }

    const passwordHash = await hashPassword(password);
    const result = await pool.query(
      "insert into users (email, password_hash, role) values ($1, $2, 'customer') returning id, email, role",
      [email, passwordHash],
    );

    await startUserSession(request, result.rows[0]);
    return response.status(201).json({ user: publicUser(result.rows[0]) });
  } catch (error) {
    if (error?.code === "23505") return response.status(409).json({ error: "An account with this email already exists." });
    return next(error);
  }
});

app.post("/api/auth/login", async (request, response, next) => {
  try {
    const email = normalizeEmail(request.body?.email);
    const password = request.body?.password;
    if (!isValidEmail(email) || typeof password !== "string") {
      return response.status(400).json({ error: "Enter your email and password." });
    }

    const result = await pool.query("select id, email, role, password_hash from users where email = $1", [email]);
    const user = result.rows[0];
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return response.status(401).json({ error: "Login failed. Check your email and password." });
    }

    if (user.password_hash.startsWith("bcrypt$")) {
      user.password_hash = await hashPassword(password);
      await pool.query("update users set password_hash=$1,updated_at=now() where id=$2", [user.password_hash, user.id]);
    }

    await startUserSession(request, user);
    return response.json({ user: publicUser(user) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/logout", (request, response, next) => {
  request.session.destroy((error) => {
    if (error) return next(error);
    response.clearCookie("shop.sid", { httpOnly: true, sameSite: "lax", secure: secureCookie });
    return response.status(204).end();
  });
});

app.get("/api/auth/me", async (request, response, next) => {
  try {
    if (!request.session.userId) return response.json({ user: null });
    const result = await pool.query("select id, email, role from users where id = $1", [request.session.userId]);
    const user = result.rows[0] ?? null;
    if (!user) request.session.destroy(() => {});
    return response.json({ user: user ? publicUser(user) : null });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/categories", async (_request, response, next) => {
  try {
    const result = await pool.query("select id, name, slug from categories order by name");
    return response.json(result.rows);
  } catch (error) {
    return next(error);
  }
});

app.get("/api/products", async (_request, response, next) => {
  try {
    return response.json(await selectProducts("where p.is_active = true order by p.name"));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/products/:id", async (request, response, next) => {
  try {
    const result = await selectProducts("where p.id = $1 and p.is_active = true", [request.params.id]);
    return result.length ? response.json(result[0]) : response.status(404).json({ error: "Product not found." });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/products", requireAdmin, async (_request, response, next) => {
  try {
    return response.json(await selectProducts("order by p.name"));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/products/:id", requireAdmin, async (request, response, next) => {
  try {
    const result = await selectProducts("where p.id = $1", [request.params.id]);
    return result.length ? response.json(result[0]) : response.status(404).json({ error: "Product not found." });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/admin/products", requireAdmin, async (request, response, next) => {
  try {
    const input = validateProduct(request.body);
    if (!input) return response.status(400).json({ error: "Product details are invalid." });
    const result = await pool.query(
      `insert into products (category_id, name, description, price, discount_percentage, stock, brand, sku, image_url, is_active)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`,
      productValues(input),
    );
    const created = await selectProducts("where p.id = $1", [result.rows[0].id]);
    return response.status(201).json(created[0]);
  } catch (error) {
    if (error?.code === "23505") return response.status(409).json({ error: "A product with this SKU already exists." });
    return next(error);
  }
});

app.put("/api/admin/products/:id", requireAdmin, async (request, response, next) => {
  try {
    const input = validateProduct(request.body);
    if (!input) return response.status(400).json({ error: "Product details are invalid." });
    const values = productValues(input);
    const result = await pool.query(
      `update products set category_id=$1, name=$2, description=$3, price=$4, discount_percentage=$5,
       stock=$6, brand=$7, sku=$8, image_url=$9, is_active=$10, updated_at=now() where id=$11 returning id`,
      [...values, request.params.id],
    );
    if (!result.rowCount) return response.status(404).json({ error: "Product not found." });
    const updated = await selectProducts("where p.id = $1", [request.params.id]);
    return response.json(updated[0]);
  } catch (error) {
    if (error?.code === "23505") return response.status(409).json({ error: "A product with this SKU already exists." });
    return next(error);
  }
});

app.get("/api/cart", requireUser, async (request, response, next) => {
  try {
    const cartId = await getOrCreateCart(request.session.userId);
    const result = await pool.query(
      `select p.id as product_id, p.name, p.price, p.image_url, p.stock, ci.quantity
       from cart_items ci join products p on p.id=ci.product_id where ci.cart_id=$1 order by ci.created_at`,
      [cartId],
    );
    return response.json(result.rows.map((row) => ({
      productId: row.product_id,
      name: row.name,
      price: Number(row.price),
      imageUrl: row.image_url,
      stock: row.stock,
      quantity: Math.min(row.quantity, row.stock),
    })));
  } catch (error) {
    return next(error);
  }
});

app.put("/api/cart", requireUser, async (request, response, next) => {
  const items = request.body?.items;
  if (!Array.isArray(items) || items.some((item) => !isCartInput(item))) {
    return response.status(400).json({ error: "Cart items are invalid." });
  }

  const client = await pool.connect();
  try {
    await client.query("begin");
    const cartId = await getOrCreateCart(request.session.userId, client);
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = productIds.length
      ? await client.query("select id, stock, is_active from products where id = any($1::uuid[]) for update", [productIds])
      : { rows: [] };
    const byId = new Map(products.rows.map((product) => [product.id, product]));
    if (productIds.some((id) => !byId.get(id)?.is_active)) {
      await client.query("rollback");
      return response.status(400).json({ error: "One or more cart products are unavailable." });
    }
    await client.query("delete from cart_items where cart_id=$1", [cartId]);
    for (const item of items) {
      const product = byId.get(item.productId);
      if (item.quantity > product.stock) {
        await client.query("rollback");
        return response.status(400).json({ error: "Cart quantity exceeds available stock." });
      }
      await client.query("insert into cart_items (cart_id, product_id, quantity) values ($1,$2,$3)", [cartId, item.productId, item.quantity]);
    }
    await client.query("commit");
    return response.status(204).end();
  } catch (error) {
    await client.query("rollback");
    return next(error);
  } finally {
    client.release();
  }
});

app.post("/api/orders", async (request, response, next) => {
  const input = validateCheckout(request.body);
  if (!input) return response.status(400).json({ error: "Checkout details or items are invalid." });

  const quantities = new Map();
  for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  const client = await pool.connect();
  try {
    await client.query("begin");
    const productIds = [...quantities.keys()];
    const products = await client.query(
      "select id, name, price, stock from products where id = any($1::uuid[]) and is_active=true for update",
      [productIds],
    );
    if (products.rowCount !== productIds.length) throw new CheckoutError("One or more products are unavailable.");

    let total = 0;
    const orderLines = [];
    for (const product of products.rows) {
      const quantity = quantities.get(product.id);
      if (quantity <= 0 || quantity > product.stock) throw new CheckoutError("Requested quantity exceeds available stock.");
      const price = Number(product.price);
      total += price * quantity;
      orderLines.push({ product, quantity, price });
    }
    if (total <= 0) throw new CheckoutError("Order total must be greater than zero.");

    const orderResult = await client.query(
      `insert into orders (user_id, customer_name, customer_email, customer_phone, shipping_address,
       shipping_postal_code, shipping_city, shipping_country, total_price, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') returning id,total_price`,
      [request.session.userId ?? null, input.customerName, input.customerEmail, input.customerPhone,
        input.shippingAddress, input.shippingPostalCode, input.shippingCity, input.shippingCountry, total],
    );
    const order = orderResult.rows[0];
    for (const line of orderLines) {
      await client.query(
        "insert into order_items (order_id, product_id, product_name, quantity, price_at_purchase) values ($1,$2,$3,$4,$5)",
        [order.id, line.product.id, line.product.name, line.quantity, line.price],
      );
    }
    await client.query("commit");
    return response.status(201).json({ id: order.id, totalPrice: Number(order.total_price) });
  } catch (error) {
    await client.query("rollback");
    if (error instanceof CheckoutError) return response.status(400).json({ error: error.message });
    return next(error);
  } finally {
    client.release();
  }
});

app.get("/api/orders/:id/summary", async (request, response, next) => {
  try {
    const result = await pool.query("select id,total_price from orders where id=$1", [request.params.id]);
    return result.rowCount
      ? response.json({ id: result.rows[0].id, totalPrice: Number(result.rows[0].total_price) })
      : response.status(404).json({ error: "Order not found." });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/orders", requireAdmin, async (_request, response, next) => {
  try {
    const result = await pool.query(
      `select id,customer_name,customer_email,total_price,status,created_at,updated_at
       from orders order by created_at desc`,
    );
    return response.json(result.rows.map(mapOrder));
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/orders/:id", requireAdmin, async (request, response, next) => {
  try {
    const orderResult = await pool.query("select * from orders where id=$1", [request.params.id]);
    if (!orderResult.rowCount) return response.status(404).json({ error: "Order not found." });
    const itemResult = await pool.query(
      "select id,product_id,product_name,quantity,price_at_purchase from order_items where order_id=$1 order by created_at",
      [request.params.id],
    );
    return response.json({ ...mapOrder(orderResult.rows[0]), ...mapShipping(orderResult.rows[0]), items: itemResult.rows.map(mapOrderItem) });
  } catch (error) {
    return next(error);
  }
});

app.patch("/api/admin/orders/:id/status", requireAdmin, async (request, response, next) => {
  const allowedStatuses = new Set(["pending", "processing", "delivered", "refunded"]);
  if (!allowedStatuses.has(request.body?.status)) return response.status(400).json({ error: "Order status is invalid." });
  try {
    const result = await pool.query("update orders set status=$1,updated_at=now() where id=$2", [request.body.status, request.params.id]);
    return result.rowCount ? response.status(204).end() : response.status(404).json({ error: "Order not found." });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _request, response, _next) => {
  if (error?.message === "Origin is not allowed by CORS.") return response.status(403).json({ error: "Request origin is not allowed." });
  console.error(error);
  return response.status(500).json({ error: "The request could not be completed." });
});

app.listen(port, "0.0.0.0", () => console.log(`Shop API listening on port ${port}`));

function requireUser(request, response, next) {
  if (!request.session.userId) return response.status(401).json({ error: "Login required." });
  return next();
}

async function requireAdmin(request, response, next) {
  if (!request.session.userId) return response.status(401).json({ error: "Login required." });
  try {
    const result = await pool.query("select role from users where id=$1", [request.session.userId]);
    if (result.rows[0]?.role !== "admin") return response.status(403).json({ error: "Admin access required." });
    return next();
  } catch (error) {
    return next(error);
  }
}

async function startUserSession(request, user) {
  await new Promise((resolve, reject) => request.session.regenerate((error) => error ? reject(error) : resolve()));
  request.session.userId = user.id;
  await new Promise((resolve, reject) => request.session.save((error) => error ? reject(error) : resolve()));
}

function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role };
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(hash).toString("hex")}`;
}

async function verifyPassword(password, encoded) {
  if (encoded.startsWith("bcrypt$")) return bcrypt.compare(password, encoded.slice("bcrypt$".length));
  const [algorithm, salt, stored] = encoded.split("$");
  if (algorithm !== "scrypt" || !salt || !stored) return false;
  const actual = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(stored, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function selectProducts(where, values = []) {
  const result = await pool.query(
    `select p.id,p.external_id,p.category_id,p.name,p.description,p.price,p.discount_percentage,p.rating,
     p.stock,p.brand,p.sku,p.image_url,p.is_active,c.name as category_name,c.slug as category_slug
     from products p left join categories c on c.id=p.category_id ${where}`,
    values,
  );
  return result.rows.map((row) => ({
    id: row.id,
    externalId: row.external_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    discountPercentage: Number(row.discount_percentage ?? 0),
    rating: row.rating === null ? null : Number(row.rating),
    stock: row.stock,
    brand: row.brand,
    sku: row.sku,
    imageUrl: row.image_url,
    isActive: row.is_active,
  }));
}

function validateProduct(value) {
  if (!value || typeof value !== "object") return null;
  const numericValid = Number.isFinite(value.price) && value.price >= 0 &&
    Number.isFinite(value.discountPercentage) && value.discountPercentage >= 0 && value.discountPercentage <= 100 &&
    Number.isInteger(value.stock) && value.stock >= 0;
  const stringsValid = typeof value.name === "string" && value.name.trim().length > 0 &&
    typeof value.sku === "string" && value.sku.trim().length > 0 &&
    typeof value.description === "string" && typeof value.brand === "string" &&
    typeof value.imageUrl === "string" && typeof value.isActive === "boolean" &&
    (value.categoryId === null || isUuid(value.categoryId));
  if (!numericValid || !stringsValid) return null;
  return { ...value, name: value.name.trim(), sku: value.sku.trim(), description: value.description.trim() || null,
    brand: value.brand.trim() || null, imageUrl: value.imageUrl.trim() || null };
}

function productValues(input) {
  return [input.categoryId, input.name, input.description, input.price, input.discountPercentage,
    input.stock, input.brand, input.sku, input.imageUrl, input.isActive];
}

function isCartInput(item) {
  return item && isUuid(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99;
}

function isUuid(value) {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validateCheckout(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items) || value.items.length === 0) return null;
  const fields = ["customerName", "customerEmail", "customerPhone", "shippingAddress", "shippingPostalCode", "shippingCity", "shippingCountry"];
  if (fields.some((field) => typeof value[field] !== "string" || !value[field].trim() || value[field].length > 300)) return null;
  if (!isValidEmail(normalizeEmail(value.customerEmail))) return null;
  if (value.items.some((item) => !isCartInput(item))) return null;
  return {
    customerName: value.customerName.trim(), customerEmail: normalizeEmail(value.customerEmail),
    customerPhone: value.customerPhone.trim(), shippingAddress: value.shippingAddress.trim(),
    shippingPostalCode: value.shippingPostalCode.trim(), shippingCity: value.shippingCity.trim(),
    shippingCountry: value.shippingCountry.trim(), items: value.items,
  };
}

async function getOrCreateCart(userId, client = pool) {
  const result = await client.query(
    `insert into carts (user_id) values ($1) on conflict (user_id) do update set updated_at=now() returning id`,
    [userId],
  );
  return result.rows[0].id;
}

function mapOrder(row) {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    totalPrice: Number(row.total_price),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapShipping(row) {
  return {
    customerPhone: row.customer_phone,
    shippingAddress: row.shipping_address,
    shippingPostalCode: row.shipping_postal_code,
    shippingCity: row.shipping_city,
    shippingCountry: row.shipping_country,
  };
}

function mapOrderItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    priceAtPurchase: Number(row.price_at_purchase),
  };
}

class CheckoutError extends Error {}
