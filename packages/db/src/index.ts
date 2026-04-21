import { Pool } from "pg";

export const connectionString =
  process.env.DATABASE_URL ?? "postgres://squeeze:squeeze@localhost:5432/squeezeintel";

export const pool = new Pool({
  connectionString
});

export async function query<T>(text: string, values: unknown[] = []): Promise<T[]> {
  const result = await pool.query<T>(text, values);
  return result.rows;
}
