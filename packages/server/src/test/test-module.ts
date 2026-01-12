import { Layer } from "effect";
import { InvoiceRepository } from "../invoice/application/ports/repository.port";
import { CreateInvoiceUseCaseLive } from "../invoice/application/use-cases/create-invoice.use-case";
import { GetByIdUseCaseLive } from "../invoice/application/use-cases/get-by-id.use-case";
import { ListInvoicesUseCaseLive } from "../invoice/application/use-cases/list-invoices.use-case";
import { UpdateInvoiceUseCaseLive } from "../invoice/application/use-cases/update-invoice.use-case";
import { InvoiceHttpHandlersLive } from "../invoice/infrastructure/http/handlers";
import { MockInvoiceRepository } from "./mock-repository";

// Create singleton mock repository instance for tests
export const mockRepository = new MockInvoiceRepository();

// Test repository layer using mock
const TestRepositoryLive = Layer.succeed(InvoiceRepository, mockRepository);

// Test use cases layer
const TestUseCaseLive = Layer.mergeAll(
	CreateInvoiceUseCaseLive,
	ListInvoicesUseCaseLive,
	GetByIdUseCaseLive,
	UpdateInvoiceUseCaseLive,
).pipe(Layer.provide(TestRepositoryLive));

// Test module - handlers with mock dependencies
export const TestInvoiceModuleLive = InvoiceHttpHandlersLive.pipe(
	Layer.provide(TestUseCaseLive),
);
