import { BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { HttpLive } from "./http/server";

const program = Effect.gen(function* () {
	yield* Layer.launch(HttpLive);
});

BunRuntime.runMain(program);
