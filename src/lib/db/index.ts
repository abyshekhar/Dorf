import { connect } from "@planetscale/database"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "@/env.mjs"

import * as mysqlSchema from "./mysql-schema"
import * as pgSchema from "./pg-schema"

// create the connection
const mySqlConnection = connect({
  url: env.DATABASE_URL,
})
const pgConnection = postgres(env.DATABASE_URL)

export const db = drizzle(pgConnection, {
  schema:pgSchema,
})
