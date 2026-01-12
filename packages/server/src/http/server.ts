import { HttpApiBuilder, HttpApiScalar, HttpServer } from "@effect/platform";
import { BunContext, BunHttpServer } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { serverPort } from "../config";
import { ApiLive } from "./api";

// Server configuration
const ServerLive = Layer.unwrapEffect(
	Effect.map(serverPort, (port) => BunHttpServer.layer({ port })),
);

// OpenAPI and Scalar docs layers
const OpenApiLive = HttpApiBuilder.middlewareOpenApi({ path: "/openapi.json" });
const ScalarLive = HttpApiScalar.layer({ path: "/docs" });

// HTTP server with routes and Scalar docs
export const HttpLive = HttpApiBuilder.serve().pipe(
	Layer.provide(ApiLive),
	Layer.provideMerge(OpenApiLive.pipe(Layer.provide(ApiLive))),
	Layer.provideMerge(ScalarLive.pipe(Layer.provide(ApiLive))),
	Layer.provide(BunContext.layer),
	Layer.provideMerge(ServerLive),
	HttpServer.withLogAddress,
);
