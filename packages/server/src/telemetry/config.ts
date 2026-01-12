import { Config } from "effect";

// Exporter type: "console" | "otlp-http"
export const telemetryExporter = Config.string("OTEL_EXPORTER_TYPE").pipe(
	Config.withDefault("otlp-http"),
);

// Service name for resource identification
export const telemetryServiceName = Config.string("OTEL_SERVICE_NAME").pipe(
	Config.withDefault("rent-invoice-api"),
);

// OTLP endpoint (HTTP)
export const telemetryEndpoint = Config.string(
	"OTEL_EXPORTER_OTLP_ENDPOINT",
).pipe(Config.withDefault("http://localhost:4318"));

// Optional: OTLP headers for authentication
export const telemetryHeaders = Config.string(
	"OTEL_EXPORTER_OTLP_HEADERS",
).pipe(Config.option);

// Batch processor settings
export const telemetryBatchMaxQueueSize = Config.number(
	"OTEL_BSP_MAX_QUEUE_SIZE",
).pipe(Config.withDefault(2048));

export const telemetryBatchMaxExportSize = Config.number(
	"OTEL_BSP_MAX_EXPORT_BATCH_SIZE",
).pipe(Config.withDefault(512));

export const telemetryBatchScheduledDelay = Config.number(
	"OTEL_BSP_SCHEDULE_DELAY",
).pipe(Config.withDefault(5000)); // 5 seconds

export const telemetryBatchExportTimeout = Config.number(
	"OTEL_BSP_EXPORT_TIMEOUT",
).pipe(Config.withDefault(30000)); // 30 seconds
