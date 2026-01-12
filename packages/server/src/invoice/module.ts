import { Layer } from "effect"
import { InfrastructureLive } from "../shared/infrastructure"
import { DrizzleInvoiceRepositoryLive } from "./infrastructure/persistence/drizzle.repository"
import { CreateInvoiceUseCaseLive } from "./application/use-cases/create-invoice.use-case"
import { ListInvoicesUseCaseLive } from "./application/use-cases/list-invoices.use-case"
import { InvoiceHttpHandlersLive } from "./infrastructure/http/handlers"

const RepositoryLive = DrizzleInvoiceRepositoryLive.pipe(
  Layer.provide(InfrastructureLive)
)

const UseCaseLive = Layer.merge(
  CreateInvoiceUseCaseLive,
  ListInvoicesUseCaseLive
).pipe(
  Layer.provide(RepositoryLive)
)

export const InvoiceModuleLive = InvoiceHttpHandlersLive.pipe(
  Layer.provide(UseCaseLive)
)
