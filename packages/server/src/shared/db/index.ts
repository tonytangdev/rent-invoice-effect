import { Context, Effect, Layer } from "effect"
import { drizzle } from "drizzle-orm/postgres-js"
import { databaseUrl } from "../../config"
import * as invoiceSchema from "../../invoice/infrastructure/persistence/schema"

const schema = { ...invoiceSchema }

// Shared database connection
export class Database extends Context.Tag("Database")<
  Database,
  ReturnType<typeof drizzle<typeof schema>>
>() {}

export const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const url = yield* databaseUrl
    return drizzle(url, { schema })
  })
)
