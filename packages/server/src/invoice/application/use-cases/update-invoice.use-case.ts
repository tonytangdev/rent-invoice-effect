import type {
	InvalidInvoiceError,
	InvoiceNotFoundError,
	UpdateInvoiceRequest,
} from "api/schemas/invoice";
import { Context, Effect, Layer } from "effect";
import type { Invoice } from "../../domain/entity";
import { InvoiceRepository } from "../ports/repository.port";

// Use case service
export class UpdateInvoiceUseCase extends Context.Tag("UpdateInvoiceUseCase")<
	UpdateInvoiceUseCase,
	{
		execute: (
			id: string,
			input: typeof UpdateInvoiceRequest.Type,
		) => Effect.Effect<Invoice, InvoiceNotFoundError | InvalidInvoiceError>;
	}
>() {}

// Layer factory
export const UpdateInvoiceUseCaseLive = Layer.effect(
	UpdateInvoiceUseCase,
	Effect.gen(function* () {
		const repository = yield* InvoiceRepository;

		return {
			execute: (id: string, input: typeof UpdateInvoiceRequest.Type) =>
				Effect.gen(function* () {
					// Get existing invoice
					const invoice = yield* repository.findById(id);

					// Update with new values
					const updatedInvoice = invoice.update({
						amountCents: input.amountCents,
						date: input.date,
					});

					// Save and return
					return yield* repository.update(updatedInvoice);
				}),
		};
	}),
);
