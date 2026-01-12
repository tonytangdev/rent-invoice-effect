import { describe, expect, test } from "bun:test";
import { InvoiceNotFoundError } from "api/schemas/invoice";
import { Effect, Exit, Layer } from "effect";
import { Invoice } from "../../domain/entity";
import { InvoiceRepository } from "../ports/repository.port";
import {
	DeleteInvoiceUseCase,
	DeleteInvoiceUseCaseLive,
} from "./delete-invoice.use-case";

describe("DeleteInvoiceUseCase", () => {
	test("deletes invoice successfully", async () => {
		const existingInvoice = Invoice.create({
			amountCents: 5000,
			date: new Date("2024-01-01"),
		});

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.die("not used"),
			findById: (id: string) => {
				if (id === existingInvoice.id) {
					return Effect.succeed(existingInvoice);
				}
				return Effect.fail(new InvoiceNotFoundError({ id }));
			},
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () => Effect.die("not used"),
			delete: (invoice: Invoice) => Effect.succeed(invoice),
		});

		const testLayer = DeleteInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* DeleteInvoiceUseCase;
			return yield* useCase.execute(existingInvoice.id);
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.id).toBe(existingInvoice.id);
		expect(result.deletedAt).not.toBeNull();
		expect(result.deletedAt?.getTime()).toBeGreaterThanOrEqual(
			existingInvoice.updatedAt.getTime(),
		);
	});

	test("fails when invoice not found", async () => {
		const notFoundId = crypto.randomUUID();
		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.die("not used"),
			findById: () => Effect.fail(new InvoiceNotFoundError({ id: notFoundId })),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () => Effect.die("not used"),
			delete: () => Effect.die("not used"),
		});

		const testLayer = DeleteInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* DeleteInvoiceUseCase;
			return yield* useCase.execute(notFoundId);
		}).pipe(Effect.provide(testLayer), Effect.runPromiseExit);

		expect(Exit.isFailure(result)).toBe(true);
	});

	test("preserves all fields except deletedAt", async () => {
		const existingInvoice = Invoice.create({
			amountCents: 5000,
			date: new Date("2024-01-01"),
		});

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.die("not used"),
			findById: () => Effect.succeed(existingInvoice),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () => Effect.die("not used"),
			delete: (invoice: Invoice) => Effect.succeed(invoice),
		});

		const testLayer = DeleteInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* DeleteInvoiceUseCase;
			return yield* useCase.execute(existingInvoice.id);
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.id).toBe(existingInvoice.id);
		expect(result.amountCents).toBe(existingInvoice.amountCents);
		expect(result.date).toEqual(existingInvoice.date);
		expect(result.createdAt).toEqual(existingInvoice.createdAt);
		expect(result.deletedAt).not.toBeNull();
	});
});
