import { InvalidInvoiceError, InvoiceNotFoundError } from "api/schemas/invoice";
import { count, eq } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { Database } from "../../../shared/db";
import { InvoiceRepository } from "../../application/ports/repository.port";
import { Invoice } from "../../domain/entity";
import { invoicesTable } from "./schema";

// Adapter - implements the port using Drizzle
export const DrizzleInvoiceRepositoryLive = Layer.effect(
	InvoiceRepository,
	Effect.gen(function* () {
		const db = yield* Database;

		const save = (invoice: Invoice) =>
			Effect.gen(function* () {
				const result = yield* Effect.tryPromise({
					try: () =>
						db
							.insert(invoicesTable)
							.values({
								id: invoice.id,
								amountCents: invoice.amountCents,
								date: invoice.date,
								createdAt: invoice.createdAt,
								updatedAt: invoice.updatedAt,
								deletedAt: invoice.deletedAt,
							})
							.returning(),
					catch: (e) => new InvalidInvoiceError({ message: String(e) }),
				});

				const saved = result[0];

				if (!saved) {
					return yield* Effect.fail(
						new InvalidInvoiceError({
							message: "Insert failed: no row returned",
						}),
					);
				}

				return new Invoice({
					id: saved.id,
					amountCents: saved.amountCents,
					date: saved.date,
					createdAt: saved.createdAt,
					updatedAt: saved.updatedAt,
					deletedAt: saved.deletedAt,
				});
			});

		const findById = (id: string) =>
			Effect.gen(function* () {
				const result = yield* Effect.tryPromise({
					try: () =>
						db.query.invoicesTable.findFirst({
							where: eq(invoicesTable.id, id),
						}),
					catch: () => new InvoiceNotFoundError({ id }),
				});

				if (!result) {
					return yield* Effect.fail(new InvoiceNotFoundError({ id }));
				}

				return new Invoice({
					id: result.id,
					amountCents: result.amountCents,
					date: result.date,
					createdAt: result.createdAt,
					updatedAt: result.updatedAt,
					deletedAt: result.deletedAt,
				});
			});

		const findAll = (params: { limit: number; offset: number }) =>
			Effect.gen(function* () {
				const [invoices, countResult] = yield* Effect.all([
					Effect.promise(() =>
						db
							.select()
							.from(invoicesTable)
							.limit(params.limit)
							.offset(params.offset),
					),
					Effect.promise(() =>
						db.select({ value: count() }).from(invoicesTable),
					),
				]);

				const total = countResult[0]?.value ?? 0;

				return {
					invoices: invoices.map(
						(row) =>
							new Invoice({
								id: row.id,
								amountCents: row.amountCents,
								date: row.date,
								createdAt: row.createdAt,
								updatedAt: row.updatedAt,
								deletedAt: row.deletedAt,
							}),
					),
					total: Number(total),
				};
			});

		const update = (invoice: Invoice) =>
			Effect.gen(function* () {
				const result = yield* Effect.tryPromise({
					try: () =>
						db
							.update(invoicesTable)
							.set({
								amountCents: invoice.amountCents,
								date: invoice.date,
								updatedAt: invoice.updatedAt,
								deletedAt: invoice.deletedAt,
							})
							.where(eq(invoicesTable.id, invoice.id))
							.returning(),
					catch: (e) => new InvalidInvoiceError({ message: String(e) }),
				});

				const updated = result[0];

				if (!updated) {
					return yield* Effect.fail(
						new InvoiceNotFoundError({ id: invoice.id }),
					);
				}

				return new Invoice({
					id: updated.id,
					amountCents: updated.amountCents,
					date: updated.date,
					createdAt: updated.createdAt,
					updatedAt: updated.updatedAt,
					deletedAt: updated.deletedAt,
				});
			});

		return { save, findById, findAll, update };
	}),
);
