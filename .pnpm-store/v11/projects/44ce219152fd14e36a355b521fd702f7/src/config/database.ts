import pg from "pg";
import env from "./env.js";
import MockPool from "./mock-database.js";

function snakeToCamel(s: string): string {
  if (s === "avatar_url") return "avatarURL";
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function transformRow(row: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    result[snakeToCamel(key)] = row[key];
  }
  return result;
}

const useMock = process.env.USE_MOCK_DB === "true" || !env.DATABASE_URL;

let pool: pg.Pool;

if (useMock) {
  console.log("Using mock database (data/ folder)");
  pool = new MockPool() as unknown as pg.Pool;
} else {
  pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
  });

  pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

  // Wrap query to convert snake_case to camelCase
  const origQuery = pool.query.bind(pool);
  pool.query = function (this: pg.Pool, ...args: any[]): any {
    const result = (origQuery as any)(...args);
    if (result instanceof Promise) {
      return result.then((res: any) => {
        if (res?.rows) {
          res.rows = res.rows.map(transformRow as any);
        }
        return res;
      });
    }
    return result;
  } as typeof pool.query;
}

export default pool;
