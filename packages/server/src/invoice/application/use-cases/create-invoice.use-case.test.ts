import { describe, expect, test } from "bun:test";
import { InvalidInvoiceError, InvoiceNotFoundError } from "api/schemas/invoice";
import { Effect, Exit, Layer } from "effect";
import type { Invoice } from "../../domain/entity";
import { InvoiceRepository } from "../ports/repository.port";
import {
	CreateInvoiceUseCase,
	CreateInvoiceUseCaseLive,
} from "./create-invoice.use-case";

describe("CreateInvoiceUseCase", () => {
	test("creates invoice successfully", async () => {
		// Mock repository
		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: (invoice: Invoice) => Effect.succeed(invoice),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
		});

		const testLayer = CreateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* CreateInvoiceUseCase;
			return yield* useCase.execute({
				amountCents: 15000,
				date: new Date("2024-01-15"),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.amountCents).toBe(15000);
		expect(result.date).toEqual(new Date("2024-01-15"));
		expect(result.id).toBeDefined();
		expect(result.deletedAt).toBeNull();
	});

	test("validates positive amount", async () => {
		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: (invoice: Invoice) => Effect.succeed(invoice),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
		});

		const testLayer = CreateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* CreateInvoiceUseCase;
			return yield* useCase.execute({
				amountCents: -100,
				date: new Date(),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromiseExit);

		expect(Exit.isFailure(result)).toBe(true);
	});

	test("validates integer amount", async () => {
		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: (invoice: Invoice) => Effect.succeed(invoice),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
		});

		const testLayer = CreateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* CreateInvoiceUseCase;
			return yield* useCase.execute({
				amountCents: 100.5,
				date: new Date(),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromiseExit);

		expect(Exit.isFailure(result)).toBe(true);
	});

	test("propagates repository errors", async () => {
		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Save failed" })),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
		});

		const testLayer = CreateInvoiceUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* CreateInvoiceUseCase;
			return yield* useCase.execute({
				amountCents: 5000,
				date: new Date(),
			});
		}).pipe(Effect.provide(testLayer), Effect.runPromiseExit);

		expect(Exit.isFailure(result)).toBe(true);
		if (Exit.isFailure(result)) {
			expect(result.cause).toBeDefined();
		}
	});
});
