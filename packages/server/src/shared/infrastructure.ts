import { Layer } from "effect";
import { DatabaseLive } from "./db";

// Shared infrastructure - all cross-cutting services
export const InfrastructureLive = Layer.mergeAll(DatabaseLive);
