import type { InvoiceNotFoundError } from "api/schemas/invoice";
import { Context, Effect, Layer } from "effect";
import type { Invoice } from "../../domain/entity";
import { InvoiceRepository } from "../ports/repository.port";

// Use case service
export class DeleteInvoiceUseCase extends Context.Tag("DeleteInvoiceUseCase")<
	DeleteInvoiceUseCase,
	{
		execute: (id: string) => Effect.Effect<Invoice, InvoiceNotFoundError>;
	}
>() {}

// Layer factory
export const DeleteInvoiceUseCaseLive = Layer.effect(
	DeleteInvoiceUseCase,
	Effect.gen(function* () {
		const repository = yield* InvoiceRepository;

		return {
			execute: (id: string) =>
				Effect.gen(function* () {
					// Get existing invoice
					const invoice = yield* repository.findById(id);

					// Soft delete
					const deletedInvoice = invoice.softDelete();

					// Save and return
					return yield* repository.delete(deletedInvoice);
				}),
		};
	}),
);
