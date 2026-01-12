import { HttpServer, HttpApiBuilder } from "@effect/platform"
import { BunHttpServer } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { serverPort } from "../config"
import { ApiLive } from "./api"

// Server configuration
const ServerLive = Layer.unwrapEffect(
  Effect.map(serverPort, (port) => BunHttpServer.layer({ port }))
)

// HTTP server with routes
export const HttpLive = HttpApiBuilder.serve().pipe(
  Layer.provide(ApiLive),
  Layer.provideMerge(ServerLive),
  HttpServer.withLogAddress
)
