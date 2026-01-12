import { HttpApiBuilder } from "@effect/platform";
import { RentInvoiceApi } from "api";
import { Layer } from "effect";
import { InvoiceModuleLive } from "../invoice/module";

// API composition - all HTTP routes
export const ApiLive = HttpApiBuilder.api(RentInvoiceApi).pipe(
	Layer.provide(InvoiceModuleLive),
);
