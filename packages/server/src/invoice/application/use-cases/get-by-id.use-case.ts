import { Effect, Context, Layer } from "effect"
import { Invoice } from "../../domain/entity"
import { InvoiceNotFoundError } from "api/schemas/invoice"
import { InvoiceRepository } from "../ports/repository.port"

// Use case service
export class GetByIdUseCase extends Context.Tag("GetByIdUseCase")<
  GetByIdUseCase,
  {
    execute: (id: string) => Effect.Effect<Invoice, InvoiceNotFoundError>
  }
>() {}

// Layer factory
export const GetByIdUseCaseLive = Layer.effect(
  GetByIdUseCase,
  Effect.gen(function* () {
    const repository = yield* InvoiceRepository

    return {
      execute: (id: string) => repository.findById(id)
    }
  })
)
