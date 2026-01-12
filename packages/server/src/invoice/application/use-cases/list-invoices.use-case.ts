import type { ListInvoicesQuery } from "api/schemas/invoice";
import { Context, Effect, Layer } from "effect";
import type { Invoice } from "../../domain/entity";
import { InvoiceRepository } from "../ports/repository.port";

// Use case service
export class ListInvoicesUseCase extends Context.Tag("ListInvoicesUseCase")<
	ListInvoicesUseCase,
	{
		execute: (
			input: typeof ListInvoicesQuery.Type,
		) => Effect.Effect<{ invoices: Invoice[]; total: number }>;
	}
>() {}

// Layer factory
export const ListInvoicesUseCaseLive = Layer.effect(
	ListInvoicesUseCase,
	Effect.gen(function* () {
		const repository = yield* InvoiceRepository;

		return {
			execute: (input: typeof ListInvoicesQuery.Type) =>
				repository.findAll({
					limit: input.limit,
					offset: input.offset,
				}),
		};
	}),
);
