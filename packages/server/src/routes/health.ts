import { HttpServerResponse } from "@effect/platform"
import { Effect } from "effect"
import { sql } from "drizzle-orm"
import { Database } from "../db"

const checkDatabaseHealth = Effect.gen(function* () {
  const db = yield* Database
  yield* Effect.tryPromise({
    try: () => db.execute(sql`SELECT 1`),
    catch: (error) => new Error(`Database health check failed: ${error}`)
  })
})

export const healthHandler = Effect.gen(function* () {
  const result = yield* Effect.either(checkDatabaseHealth)

  if (result._tag === "Right") {
    return yield* HttpServerResponse.json({
      status: "healthy",
      database: "connected"
    })
  }

  return yield* HttpServerResponse.json(
    {
      status: "unhealthy",
      database: "disconnected",
      error: result.left.message
    },
    { status: 503 }
  )
})
