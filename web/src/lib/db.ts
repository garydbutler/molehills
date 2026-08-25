import { sql as vercelSql } from "@vercel/postgres";

/*
  Shared Postgres client. Locally this needs POSTGRES_URL in .env.local;
  on Vercel it comes automatically from the Vercel Postgres / Neon
  integration once the database is linked to this project.
*/
export const sql = vercelSql;

export async function isDbConfigured(): Promise<boolean> {
  return Boolean(process.env.POSTGRES_URL);
}
