import { describe, expect, test } from "bun:test";
import { InvalidInvoiceError, InvoiceNotFoundError } from "api/schemas/invoice";
import { Effect, Exit, Layer } from "effect";
import { Invoice } from "../../domain/entity";
import { InvoiceRepository } from "../ports/repository.port";
import {
	UpdateInvoiceUseCase,
	UpdateInvoiceUseCaseLive,
} from "./update-invoice.use-case";

describe("UpdateInvoiceUseCase", () => {
	test("updates invoice successfully", async () => {
		const existingInvoice = Invoice.create({
			amountCents: 5000,
			date: new Date("2024-01-01"),
		});

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: (id: string) => {
				if (id === existingInvoice.id) {
					return Effect.succeed(existingInvoice);
				}
				return Effect.fail(new InvoiceNotFoundError({ id }));
			},
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: (invoice: Invoice) => Effect.succeed(invoice),
		});

		const testLayer = UpdateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* UpdateInvoiceUseCase;
			return yield* useCase.execute(existingInvoice.id, {
				amountCents: 7500,
				date: new Date("2024-02-01"),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.id).toBe(existingInvoice.id);
		expect(result.amountCents).toBe(7500);
		expect(result.date).toEqual(new Date("2024-02-01"));
		expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
			existingInvoice.updatedAt.getTime(),
		);
	});

	test("fails when invoice not found", async () => {
		const notFoundId = crypto.randomUUID();
		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: () => Effect.fail(new InvoiceNotFoundError({ id: notFoundId })),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
		});

		const testLayer = UpdateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* UpdateInvoiceUseCase;
			return yield* useCase.execute(notFoundId, {
				amountCents: 7500,
				date: new Date(),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromiseExit);

		expect(Exit.isFailure(result)).toBe(true);
	});

	test("updates only amountCents when date not provided", async () => {
		const existingInvoice = Invoice.create({
			amountCents: 5000,
			date: new Date("2024-01-01"),
		});

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: () => Effect.succeed(existingInvoice),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: (invoice: Invoice) => Effect.succeed(invoice),
		});

		const testLayer = UpdateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* UpdateInvoiceUseCase;
			return yield* useCase.execute(existingInvoice.id, {
				amountCents: 8000,
				date: undefined,
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.amountCents).toBe(8000);
		expect(result.date).toEqual(existingInvoice.date);
	});

	test("updates only date when amountCents not provided", async () => {
		const existingInvoice = Invoice.create({
			amountCents: 5000,
			date: new Date("2024-01-01"),
		});

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: () => Effect.succeed(existingInvoice),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: (invoice: Invoice) => Effect.succeed(invoice),
		});

		const testLayer = UpdateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* UpdateInvoiceUseCase;
			return yield* useCase.execute(existingInvoice.id, {
				amountCents: undefined,
				date: new Date("2024-03-01"),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.amountCents).toBe(5000);
		expect(result.date).toEqual(new Date("2024-03-01"));
	});

	test("propagates repository update errors", async () => {
		const existingInvoice = Invoice.create({
			amountCents: 5000,
			date: new Date("2024-01-01"),
		});

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: () => Effect.succeed(existingInvoice),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Update failed" })),
		});

		const testLayer = UpdateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* UpdateInvoiceUseCase;
			return yield* useCase.execute(existingInvoice.id, {
				amountCents: 7500,
				date: new Date(),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromiseExit);

		expect(Exit.isFailure(result)).toBe(true);
	});

	test("preserves createdAt and other fields", async () => {
		const existingInvoice = Invoice.create({
			amountCents: 5000,
			date: new Date("2024-01-01"),
		});

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: () => Effect.succeed(existingInvoice),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: (invoice: Invoice) => Effect.succeed(invoice),
		});

		const testLayer = UpdateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* UpdateInvoiceUseCase;
			return yield* useCase.execute(existingInvoice.id, {
				amountCents: 6000,
				date: new Date("2024-02-01"),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.createdAt).toEqual(existingInvoice.createdAt);
		expect(result.deletedAt).toBe(existingInvoice.deletedAt);
	});
});
