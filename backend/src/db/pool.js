import pg from "pg";

const { Pool } = pg;

export const pool = new Pool(
  process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        host: process.env.PGHOST ?? "localhost",
        port: Number(process.env.PGPORT ?? process.env.DB_PORT ?? 5432),
        database: process.env.PGDATABASE ?? process.env.POSTGRES_DB ?? "shop",
        user: process.env.PGUSER ?? process.env.POSTGRES_USER ?? "shop",
        password: process.env.PGPASSWORD ?? process.env.POSTGRES_PASSWORD ?? "shop",
      },
);

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});
