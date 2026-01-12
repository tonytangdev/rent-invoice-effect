import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { RentInvoiceApi } from "api"
import { CreateInvoiceUseCase } from "../../application/use-cases/create-invoice.use-case"

// HTTP Adapter - translates HTTP requests to use case calls
export const InvoiceHttpHandlersLive = HttpApiBuilder.group(
  RentInvoiceApi,
  "invoices",
  (handlers) =>
    handlers
      .handle("create", ({ payload }) =>
        Effect.gen(function* () {
          const useCase = yield* CreateInvoiceUseCase

          // Execute use case - HttpApiBuilder handles ParseError automatically
          const invoice = yield* useCase.execute({
            amountCents: payload.amountCents,
            date: payload.date
          })

          // Map domain entity to API response schema
          return {
            id: invoice.id,
            amountCents: invoice.amountCents,
            date: invoice.date,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt,
            deletedAt: invoice.deletedAt
          }
        })
      )
      .handle("getById", () => Effect.dieMessage("Not implemented"))
      .handle("list", () => Effect.dieMessage("Not implemented"))
      .handle("update", () => Effect.dieMessage("Not implemented"))
)
