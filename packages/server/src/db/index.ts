import { Context, Effect, Layer } from "effect"
import { drizzle } from "drizzle-orm/postgres-js"
import { databaseUrl } from "../config"

export class Database extends Context.Tag("Database")<
  Database,
  ReturnType<typeof drizzle>
>() {}

export const DatabaseLive = Layer.effect(
  Database,
  Effect.gen(function* () {
    const url = yield* databaseUrl
    return drizzle(url)
  })
)
