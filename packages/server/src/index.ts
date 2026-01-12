import { BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { HttpLive } from "./http/server";
import { TelemetryLive } from "./telemetry";

const program = Effect.gen(function* () {
	yield* Layer.launch(HttpLive);
}).pipe(Effect.provide(TelemetryLive));

BunRuntime.runMain(program);
