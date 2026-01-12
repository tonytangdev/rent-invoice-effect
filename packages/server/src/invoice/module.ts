import { Layer } from "effect"
import { InfrastructureLive } from "../shared/infrastructure"
import { DrizzleInvoiceRepositoryLive } from "./infrastructure/persistence/drizzle.repository"
import { CreateInvoiceUseCaseLive } from "./application/use-cases/create-invoice.use-case"
import { InvoiceHttpHandlersLive } from "./infrastructure/http/handlers"

const RepositoryLive = DrizzleInvoiceRepositoryLive.pipe(
  Layer.provide(InfrastructureLive)
)

const UseCaseLive = CreateInvoiceUseCaseLive.pipe(
  Layer.provide(RepositoryLive)
)

export const InvoiceModuleLive = InvoiceHttpHandlersLive.pipe(
  Layer.provide(UseCaseLive)
)
