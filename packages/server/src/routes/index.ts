import { HttpRouter, HttpServerResponse } from "@effect/platform"
import { healthHandler } from "./health"

export const router = HttpRouter.empty.pipe(
  HttpRouter.get("/", HttpServerResponse.json({ message: "Hello World" })),
  HttpRouter.get("/health", healthHandler)
)
