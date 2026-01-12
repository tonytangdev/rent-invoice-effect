import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { Effect, Layer } from "effect";
import * as telemetryConfig from "./config";
import { createSpanExporter } from "./exporters";

// Create NodeSdk layer with dynamic configuration
export const TelemetryLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const serviceName = yield* telemetryConfig.telemetryServiceName;
		const spanExporter = yield* createSpanExporter;

		// Batch processor configuration
		const maxQueueSize = yield* telemetryConfig.telemetryBatchMaxQueueSize;
		const maxExportBatchSize =
			yield* telemetryConfig.telemetryBatchMaxExportSize;
		const scheduledDelayMillis =
			yield* telemetryConfig.telemetryBatchScheduledDelay;
		const exportTimeoutMillis =
			yield* telemetryConfig.telemetryBatchExportTimeout;

		const spanProcessor = new BatchSpanProcessor(spanExporter, {
			maxQueueSize,
			maxExportBatchSize,
			scheduledDelayMillis,
			exportTimeoutMillis,
		});

		// Return NodeSdk layer with configured exporter
		return NodeSdk.layer(() => ({
			resource: { serviceName },
			spanProcessor,
		}));
	}),
);
