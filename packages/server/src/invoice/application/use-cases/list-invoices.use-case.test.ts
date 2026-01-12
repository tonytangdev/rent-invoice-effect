import { describe, expect, test } from "bun:test";
import { InvalidInvoiceError, InvoiceNotFoundError } from "api/schemas/invoice";
import { Effect, Layer } from "effect";
import { Invoice } from "../../domain/entity";
import { InvoiceRepository } from "../ports/repository.port";
import {
	ListInvoicesUseCase,
	ListInvoicesUseCaseLive,
} from "./list-invoices.use-case";

describe("ListInvoicesUseCase", () => {
	test("returns empty list when no invoices", async () => {
		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: () => Effect.succeed({ invoices: [], total: 0 }),
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			delete: () => Effect.fail(new InvoiceNotFoundError({ id: "" })),
		});

		const testLayer = ListInvoicesUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* ListInvoicesUseCase;
			return yield* useCase.execute({ limit: 10, offset: 0 });
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.invoices).toEqual([]);
		expect(result.total).toBe(0);
	});

	test("returns invoices with correct pagination", async () => {
		const invoice1 = Invoice.create({ amountCents: 5000, date: new Date() });
		const invoice2 = Invoice.create({ amountCents: 7500, date: new Date() });
		const invoice3 = Invoice.create({ amountCents: 10000, date: new Date() });

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: (params) => {
				const allInvoices = [invoice1, invoice2, invoice3];
				const invoices = allInvoices.slice(
					params.offset,
					params.offset + params.limit,
				);
				return Effect.succeed({ invoices, total: allInvoices.length });
			},
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			delete: () => Effect.fail(new InvoiceNotFoundError({ id: "" })),
		});

		const testLayer = ListInvoicesUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* ListInvoicesUseCase;
			return yield* useCase.execute({ limit: 2, offset: 0 });
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.invoices).toHaveLength(2);
		expect(result.total).toBe(3);
		expect(result.invoices[0]?.id).toBe(invoice1.id);
		expect(result.invoices[1]?.id).toBe(invoice2.id);
	});

	test("handles offset correctly", async () => {
		const invoice1 = Invoice.create({ amountCents: 5000, date: new Date() });
		const invoice2 = Invoice.create({ amountCents: 7500, date: new Date() });
		const invoice3 = Invoice.create({ amountCents: 10000, date: new Date() });

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: (params) => {
				const allInvoices = [invoice1, invoice2, invoice3];
				const invoices = allInvoices.slice(
					params.offset,
					params.offset + params.limit,
				);
				return Effect.succeed({ invoices, total: allInvoices.length });
			},
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			delete: () => Effect.fail(new InvoiceNotFoundError({ id: "" })),
		});

		const testLayer = ListInvoicesUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* ListInvoicesUseCase;
			return yield* useCase.execute({ limit: 2, offset: 1 });
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.invoices).toHaveLength(2);
		expect(result.total).toBe(3);
		expect(result.invoices[0]?.id).toBe(invoice2.id);
		expect(result.invoices[1]?.id).toBe(invoice3.id);
	});

	test("respects limit parameter", async () => {
		const invoices = Array.from({ length: 10 }, (_, i) =>
			Invoice.create({ amountCents: (i + 1) * 1000, date: new Date() }),
		);

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: (params) => {
				const slice = invoices.slice(
					params.offset,
					params.offset + params.limit,
				);
				return Effect.succeed({ invoices: slice, total: invoices.length });
			},
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			delete: () => Effect.fail(new InvoiceNotFoundError({ id: "" })),
		});

		const testLayer = ListInvoicesUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* ListInvoicesUseCase;
			return yield* useCase.execute({ limit: 5, offset: 0 });
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.invoices).toHaveLength(5);
		expect(result.total).toBe(10);
	});

	test("excludes deleted invoices", async () => {
		const invoice1 = Invoice.create({ amountCents: 5000, date: new Date() });
		const invoice2 = Invoice.create({ amountCents: 7500, date: new Date() });
		const deletedInvoice = Invoice.create({
			amountCents: 10000,
			date: new Date(),
		}).softDelete();

		const mockRepo = Layer.succeed(InvoiceRepository, {
			save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			findById: (id: string) => Effect.fail(new InvoiceNotFoundError({ id })),
			findAll: () => {
				// Mock repo only returns non-deleted invoices
				return Effect.succeed({ invoices: [invoice1, invoice2], total: 2 });
			},
			update: () =>
				Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
			delete: () => Effect.fail(new InvoiceNotFoundError({ id: "" })),
		});

		const testLayer = ListInvoicesUseCaseLive.pipe(Layer.provide(mockRepo));

		const result = await Effect.gen(function* () {
			const useCase = yield* ListInvoicesUseCase;
			return yield* useCase.execute({ limit: 10, offset: 0 });
		}).pipe(Effect.provide(testLayer), Effect.runPromise);

		expect(result.invoices).toHaveLength(2);
		expect(result.total).toBe(2);
		expect(
			result.invoices.find((i) => i.id === deletedInvoice.id),
		).toBeUndefined();
	});
});
