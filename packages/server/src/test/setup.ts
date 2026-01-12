import { HttpApiBuilder, HttpServer } from "@effect/platform";
import { BunContext, BunHttpServer } from "@effect/platform-bun";
import { RentInvoiceApi } from "api";
import { Effect, Layer, ManagedRuntime } from "effect";
import { TestInvoiceModuleLive } from "./test-module";

export interface TestServer {
	url: string;
	shutdown: () => Promise<void>;
}

export async function startTestServer(): Promise<TestServer> {
	// Create API layer with test module
	const TestApiLive = HttpApiBuilder.api(RentInvoiceApi).pipe(
		Layer.provide(TestInvoiceModuleLive),
	);

	// Server on random port (port: 0)
	const TestServerLive = BunHttpServer.layer({ port: 0 });

	// Compose HTTP server layer
	const TestHttpLive = HttpApiBuilder.serve().pipe(
		Layer.provide(TestApiLive),
		Layer.provide(BunContext.layer),
		Layer.provideMerge(TestServerLive),
	);

	// Create managed runtime
	const runtime = ManagedRuntime.make(TestHttpLive);

	// Get server info
	const url = await runtime.runPromise(
		Effect.gen(function* () {
			const server = yield* HttpServer.HttpServer;
			const address = server.address;

			if (address._tag === "TcpAddress") {
				return `http://${address.hostname}:${address.port}`;
			}
			// UnixAddress - should not happen with TCP server
			return `http://localhost:3000`;
		}),
	);

	// Wait a bit for server to be ready
	await Effect.runPromise(Effect.sleep("100 millis"));

	return {
		url,
		shutdown: async () => {
			await runtime.dispose();
		},
	};
}
