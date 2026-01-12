import type {
	InvalidInvoiceError,
	InvoiceNotFoundError,
} from "api/schemas/invoice";
import { Context, type Effect } from "effect";
import type { Invoice } from "../../domain/entity";

// Port (interface) - defines what the application needs
// No implementation details, just the contract
export interface InvoiceRepositoryService {
	save: (invoice: Invoice) => Effect.Effect<Invoice, InvalidInvoiceError>;
	findById: (id: string) => Effect.Effect<Invoice, InvoiceNotFoundError>;
	findAll: (params: {
		limit: number;
		offset: number;
	}) => Effect.Effect<{ invoices: Invoice[]; total: number }>;
	update: (
		invoice: Invoice,
	) => Effect.Effect<Invoice, InvoiceNotFoundError | InvalidInvoiceError>;
}

export class InvoiceRepository extends Context.Tag("InvoiceRepository")<
	InvoiceRepository,
	InvoiceRepositoryService
>() {}
