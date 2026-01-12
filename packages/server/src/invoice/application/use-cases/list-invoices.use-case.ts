import { Effect, Context, Layer } from "effect"
import { Invoice } from "../../domain/entity"
import { ListInvoicesQuery } from "api/schemas/invoice"
import { InvoiceRepository } from "../ports/repository.port"

// Use case service
export class ListInvoicesUseCase extends Context.Tag("ListInvoicesUseCase")<
  ListInvoicesUseCase,
  {
    execute: (input: typeof ListInvoicesQuery.Type) => Effect.Effect<{ invoices: Invoice[]; total: number }>
  }
>() {}

// Layer factory
export const ListInvoicesUseCaseLive = Layer.effect(
  ListInvoicesUseCase,
  Effect.gen(function* () {
    const repository = yield* InvoiceRepository

    return {
      execute: (input: typeof ListInvoicesQuery.Type) =>
        repository.findAll({
          limit: input.limit,
          offset: input.offset
        })
    }
  })
)
