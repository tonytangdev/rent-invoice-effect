import {
	type InvalidInvoiceError,
	InvoiceNotFoundError,
} from "api/schemas/invoice";
import { Effect } from "effect";
import type { InvoiceRepositoryService } from "../invoice/application/ports/repository.port";
import type { Invoice } from "../invoice/domain/entity";

export class MockInvoiceRepository implements InvoiceRepositoryService {
	private invoices = new Map<string, Invoice>();

	save(invoice: Invoice): Effect.Effect<Invoice, InvalidInvoiceError> {
		this.invoices.set(invoice.id, invoice);
		return Effect.succeed(invoice);
	}

	findById(id: string): Effect.Effect<Invoice, InvoiceNotFoundError> {
		const invoice = this.invoices.get(id);
		if (!invoice) {
			return Effect.fail(new InvoiceNotFoundError({ id }));
		}
		return Effect.succeed(invoice);
	}

	findAll(params: {
		limit: number;
		offset: number;
	}): Effect.Effect<{ invoices: Invoice[]; total: number }> {
		const allInvoices = Array.from(this.invoices.values());
		const total = allInvoices.length;
		const paginated = allInvoices.slice(
			params.offset,
			params.offset + params.limit,
		);

		return Effect.succeed({
			invoices: paginated,
			total,
		});
	}

	update(
		invoice: Invoice,
	): Effect.Effect<Invoice, InvoiceNotFoundError | InvalidInvoiceError> {
		if (!this.invoices.has(invoice.id)) {
			return Effect.fail(new InvoiceNotFoundError({ id: invoice.id }));
		}
		this.invoices.set(invoice.id, invoice);
		return Effect.succeed(invoice);
	}

	clear(): void {
		this.invoices.clear();
	}
}
