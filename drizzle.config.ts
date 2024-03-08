import type { Config } from "drizzle-kit";





export default {
  schema: "./src/lib/db/pg-schema.ts",
  // schema: "./src/lib/db/mysql-schema.ts", //uncomment for mysql db usage
  out: "./drizzle",
  connectionString: process.env.DATABASE_URL,
} satisfies Config