import { HttpApiBuilder } from "@effect/platform";
import { RentInvoiceApi } from "api";
import { Effect } from "effect";
import { CreateInvoiceUseCase } from "../../application/use-cases/create-invoice.use-case";
import { DeleteInvoiceUseCase } from "../../application/use-cases/delete-invoice.use-case";
import { GetByIdUseCase } from "../../application/use-cases/get-by-id.use-case";
import { ListInvoicesUseCase } from "../../application/use-cases/list-invoices.use-case";
import { UpdateInvoiceUseCase } from "../../application/use-cases/update-invoice.use-case";

// HTTP Adapter - translates HTTP requests to use case calls
export const InvoiceHttpHandlersLive = HttpApiBuilder.group(
	RentInvoiceApi,
	"invoices",
	(handlers) =>
		handlers
			.handle("create", ({ payload }) =>
				Effect.gen(function* () {
					const useCase = yield* CreateInvoiceUseCase;

					// Execute use case - HttpApiBuilder handles ParseError automatically
					const invoice = yield* useCase.execute({
						amountCents: payload.amountCents,
						date: payload.date,
					});

					// Map domain entity to API response schema
					return {
						id: invoice.id,
						amountCents: invoice.amountCents,
						date: invoice.date,
						createdAt: invoice.createdAt,
						updatedAt: invoice.updatedAt,
						deletedAt: invoice.deletedAt,
					};
				}).pipe(Effect.withSpan("invoices.create")),
			)
			.handle("getById", ({ path }) =>
				Effect.gen(function* () {
					const useCase = yield* GetByIdUseCase;

					// Execute use case
					const invoice = yield* useCase.execute(path.id);

					// Map domain entity to API response schema
					return {
						id: invoice.id,
						amountCents: invoice.amountCents,
						date: invoice.date,
						createdAt: invoice.createdAt,
						updatedAt: invoice.updatedAt,
						deletedAt: invoice.deletedAt,
					};
				}).pipe(Effect.withSpan("invoices.getById")),
			)
			.handle("list", ({ urlParams }) =>
				Effect.gen(function* () {
					const useCase = yield* ListInvoicesUseCase;

					// Execute use case
					const result = yield* useCase.execute({
						limit: urlParams.limit,
						offset: urlParams.offset,
					});

					// Map to API response schema
					return {
						invoices: result.invoices.map((invoice) => ({
							id: invoice.id,
							amountCents: invoice.amountCents,
							date: invoice.date,
							createdAt: invoice.createdAt,
							updatedAt: invoice.updatedAt,
							deletedAt: invoice.deletedAt,
						})),
						total: result.total,
					};
				}).pipe(Effect.withSpan("invoices.list")),
			)
			.handle("update", ({ path, payload }) =>
				Effect.gen(function* () {
					const useCase = yield* UpdateInvoiceUseCase;

					// Execute use case
					const invoice = yield* useCase.execute(path.id, {
						amountCents: payload.amountCents,
						date: payload.date,
					});

					// Map domain entity to API response schema
					return {
						id: invoice.id,
						amountCents: invoice.amountCents,
						date: invoice.date,
						createdAt: invoice.createdAt,
						updatedAt: invoice.updatedAt,
						deletedAt: invoice.deletedAt,
					};
				}).pipe(Effect.withSpan("invoices.update")),
			)
			.handle("delete", ({ path }) =>
				Effect.gen(function* () {
					const useCase = yield* DeleteInvoiceUseCase;

					// Execute use case
					const invoice = yield* useCase.execute(path.id);

					// Map domain entity to API response schema
					return {
						id: invoice.id,
						amountCents: invoice.amountCents,
						date: invoice.date,
						createdAt: invoice.createdAt,
						updatedAt: invoice.updatedAt,
						deletedAt: invoice.deletedAt,
					};
				}).pipe(Effect.withSpan("invoices.delete")),
			),
);
