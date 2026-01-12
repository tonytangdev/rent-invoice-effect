import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import type { TestServer } from "../test/setup";
import { startTestServer } from "../test/setup";
import { mockRepository } from "../test/test-module";

// Response types (JSON serialized)
interface InvoiceResponse {
	id: string;
	amountCents: number;
	date: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface InvoiceListResponse {
	invoices: InvoiceResponse[];
	total: number;
}

describe("Invoice API e2e", () => {
	let server: TestServer;
	let baseUrl: string;

	beforeAll(async () => {
		server = await startTestServer();
		baseUrl = server.url;
	});

	afterAll(async () => {
		await server.shutdown();
	});

	afterEach(() => {
		// Clear mock repository between tests
		mockRepository.clear();
	});

	describe("POST /api/v1/invoices", () => {
		test("creates invoice successfully", async () => {
			const response = await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 10000,
					date: "2024-01-15T00:00:00.000Z",
				}),
			});

			expect(response.status).toBe(200);

			const body = (await response.json()) as InvoiceResponse;
			expect(body.amountCents).toBe(10000);
			expect(body.date).toBe("2024-01-15T00:00:00.000Z");
			expect(body.id).toBeDefined();
			expect(body.createdAt).toBeDefined();
			expect(body.updatedAt).toBeDefined();
			expect(body.deletedAt).toBeNull();
		});

		test("returns 400 for invalid payload", async () => {
			const response = await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: -100,
					date: "2024-01-15T00:00:00.000Z",
				}),
			});

			expect(response.status).toBe(400);
		});

		test("returns 400 for missing required fields", async () => {
			const response = await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({}),
			});

			expect(response.status).toBe(400);
		});
	});

	describe("GET /api/v1/invoices/:id", () => {
		test("gets invoice by id", async () => {
			// Create invoice first
			const createResponse = await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 15000,
					date: "2024-02-01T00:00:00.000Z",
				}),
			});

			const created = (await createResponse.json()) as InvoiceResponse;

			// Get by ID
			const response = await fetch(`${baseUrl}/api/v1/invoices/${created.id}`);

			expect(response.status).toBe(200);

			const body = (await response.json()) as InvoiceResponse;
			expect(body.id).toBe(created.id);
			expect(body.amountCents).toBe(15000);
			expect(body.date).toBe("2024-02-01T00:00:00.000Z");
		});

		test("returns 404 for non-existent id", async () => {
			// Use valid UUID that doesn't exist
			const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";
			const response = await fetch(
				`${baseUrl}/api/v1/invoices/${nonExistentId}`,
			);

			expect(response.status).toBe(404);
		});
	});

	describe("GET /api/v1/invoices", () => {
		test("lists invoices with pagination", async () => {
			// Create multiple invoices
			await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 10000,
					date: "2024-01-01T00:00:00.000Z",
				}),
			});

			await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 20000,
					date: "2024-01-02T00:00:00.000Z",
				}),
			});

			await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 30000,
					date: "2024-01-03T00:00:00.000Z",
				}),
			});

			// List with pagination
			const response = await fetch(
				`${baseUrl}/api/v1/invoices?limit=2&offset=0`,
			);

			expect(response.status).toBe(200);

			const body = (await response.json()) as InvoiceListResponse;
			expect(body.invoices).toHaveLength(2);
			expect(body.total).toBe(3);
		});

		test("uses default pagination when not specified", async () => {
			const response = await fetch(`${baseUrl}/api/v1/invoices`);

			expect(response.status).toBe(200);

			const body = (await response.json()) as InvoiceListResponse;
			expect(body.invoices).toBeDefined();
			expect(body.total).toBeDefined();
		});
	});

	describe("PATCH /api/v1/invoices/:id", () => {
		test("updates invoice", async () => {
			// Create invoice
			const createResponse = await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 10000,
					date: "2024-01-01T00:00:00.000Z",
				}),
			});

			const created = (await createResponse.json()) as InvoiceResponse;

			// Update invoice
			const response = await fetch(`${baseUrl}/api/v1/invoices/${created.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 25000,
				}),
			});

			expect(response.status).toBe(200);

			const body = (await response.json()) as InvoiceResponse;
			expect(body.amountCents).toBe(25000);
			expect(body.date).toBe("2024-01-01T00:00:00.000Z"); // Date unchanged
		});

		test("returns 404 for non-existent id", async () => {
			// Use valid UUID that doesn't exist
			const nonExistentId = "550e8400-e29b-41d4-a716-446655440000";
			const response = await fetch(
				`${baseUrl}/api/v1/invoices/${nonExistentId}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						amountCents: 25000,
					}),
				},
			);

			expect(response.status).toBe(404);
		});

		test("returns 400 for invalid update data", async () => {
			// Create invoice
			const createResponse = await fetch(`${baseUrl}/api/v1/invoices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: 10000,
					date: "2024-01-01T00:00:00.000Z",
				}),
			});

			const created = (await createResponse.json()) as InvoiceResponse;

			// Try to update with invalid data
			const response = await fetch(`${baseUrl}/api/v1/invoices/${created.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amountCents: -500,
				}),
			});

			expect(response.status).toBe(400);
		});
	});
});
