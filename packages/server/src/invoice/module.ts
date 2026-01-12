import { Layer } from "effect";
import { InfrastructureLive } from "../shared/infrastructure";
import { CreateInvoiceUseCaseLive } from "./application/use-cases/create-invoice.use-case";
import { DeleteInvoiceUseCaseLive } from "./application/use-cases/delete-invoice.use-case";
import { GetByIdUseCaseLive } from "./application/use-cases/get-by-id.use-case";
import { ListInvoicesUseCaseLive } from "./application/use-cases/list-invoices.use-case";
import { UpdateInvoiceUseCaseLive } from "./application/use-cases/update-invoice.use-case";
import { InvoiceHttpHandlersLive } from "./infrastructure/http/handlers";
import { DrizzleInvoiceRepositoryLive } from "./infrastructure/persistence/drizzle.repository";

const RepositoryLive = DrizzleInvoiceRepositoryLive.pipe(
	Layer.provide(InfrastructureLive),
);

const UseCaseLive = Layer.mergeAll(
	CreateInvoiceUseCaseLive,
	ListInvoicesUseCaseLive,
	GetByIdUseCaseLive,
	UpdateInvoiceUseCaseLive,
	DeleteInvoiceUseCaseLive,
).pipe(Layer.provide(RepositoryLive));

export const InvoiceModuleLive = InvoiceHttpHandlersLive.pipe(
	Layer.provide(UseCaseLive),
);
