import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect"

const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", HttpServerResponse.json({ message: "Hello World" }))
)

const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress)

const port = 3000

const ServerLive = BunHttpServer.layer({ port })

BunRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)))
