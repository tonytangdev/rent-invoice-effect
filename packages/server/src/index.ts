import { HttpServer } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Effect, Layer } from "effect"
import { router } from "./routes"
import { serverPort } from "./config"
import { DatabaseLive } from "./db"

const ServerLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const port = yield* serverPort
    return BunHttpServer.layer({ port })
  })
)

const app = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress
)

const AppLive = Layer.mergeAll(ServerLive, DatabaseLive)

BunRuntime.runMain(Layer.launch(Layer.provide(app, AppLive)))
