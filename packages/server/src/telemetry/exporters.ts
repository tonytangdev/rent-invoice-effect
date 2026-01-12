import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import type { SpanExporter } from "@opentelemetry/sdk-trace-base";
import { ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { Effect, Option } from "effect";
import * as telemetryConfig from "./config";

// Parse headers from string format: "key1=val1,key2=val2"
const parseHeaders = (headerString: string): Record<string, string> => {
	return headerString.split(",").reduce(
		(acc, pair) => {
			const [key, value] = pair.split("=");
			if (key && value) acc[key.trim()] = value.trim();
			return acc;
		},
		{} as Record<string, string>,
	);
};

// Create span exporter based on type
export const createSpanExporter = Effect.gen(function* () {
	const exporterType = yield* telemetryConfig.telemetryExporter;
	const endpoint = yield* telemetryConfig.telemetryEndpoint;
	const headersOption = yield* telemetryConfig.telemetryHeaders;

	const headers = Option.match(headersOption, {
		onNone: () => undefined,
		onSome: parseHeaders,
	});

	switch (exporterType) {
		case "otlp-http":
			return new OTLPTraceExporter({
				url: `${endpoint}/v1/traces`,
				headers,
			}) as SpanExporter;

		case "console":
		default:
			return new ConsoleSpanExporter() as SpanExporter;
	}
});
