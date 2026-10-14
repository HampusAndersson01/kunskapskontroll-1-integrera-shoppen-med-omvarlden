import { Pool } from "pg";
import fs from "node:fs";
import path from "node:path";

loadEnvFile(path.resolve(".env"));
loadEnvFile(path.resolve(".env.local"));

const sourceUrl = process.env.SOURCE_SUPABASE_DATABASE_URL;
if (!sourceUrl) throw new Error("Set SOURCE_SUPABASE_DATABASE_URL for this one-time data transfer.");

const source = new Pool({ connectionString: sourceUrl, max: 2 });
const target = new Pool({
  host: process.env.PGHOST ?? "localhost",
  port: Number(process.env.PGPORT ?? 5432),
  database: process.env.PGDATABASE ?? process.env.POSTGRES_DB ?? "shop",
  user: process.env.PGUSER ?? process.env.POSTGRES_USER ?? "shop",
  password: process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD,
});

try {
  const { rows } = await source.query(`
    select u.id, u.email, u.encrypted_password, u.created_at, u.updated_at,
           p.role, p.created_at as profile_created_at, p.updated_at as profile_updated_at
    from auth.users u
    left join public.profiles p on p.id = u.id
    order by u.created_at
  `);

  const client = await target.connect();
  try {
    await client.query("begin");
    const { rows: existingUsers } = await client.query("select count(*)::int as count from users");
    if (existingUsers[0].count > 0) {
      throw new Error("The target database already has users; refusing to repeat this one-time import.");
    }

    for (const row of rows) {
      const email = row.email?.trim().toLowerCase() || `legacy-${row.id}@invalid.local`;
      const passwordHash = row.encrypted_password
        ? `bcrypt$${row.encrypted_password}`
        : `unusable$${row.id}`;
      const role = row.role === "admin" ? "admin" : "customer";
      await client.query(
        `insert into users (id,email,password_hash,role,created_at,updated_at)
         values ($1,$2,$3,$4,$5,$6)
         on conflict (id) do update set email=excluded.email,password_hash=excluded.password_hash,
         role=excluded.role,updated_at=excluded.updated_at`,
        [row.id, email, passwordHash, role, row.profile_created_at ?? row.created_at, row.profile_updated_at ?? row.updated_at],
      );
    }
    await client.query("commit");
    console.log(`Transferred ${rows.length} user records. Passwords without a source hash require reset.`);
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
} finally {
  await Promise.all([source.end(), target.end()]);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}
