import { Effect, Context, Layer } from "effect"
import { Invoice } from "../../domain/entity"
import { InvalidInvoiceError, CreateInvoiceRequest } from "api/schemas/invoice"
import { InvoiceRepository } from "../ports/repository.port"

// Use case service
export class CreateInvoiceUseCase extends Context.Tag("CreateInvoiceUseCase")<
  CreateInvoiceUseCase,
  {
    execute: (input: typeof CreateInvoiceRequest.Type) => Effect.Effect<Invoice, InvalidInvoiceError>
  }
>() {}

// Layer factory
export const CreateInvoiceUseCaseLive = Layer.effect(
  CreateInvoiceUseCase,
  Effect.gen(function* () {
    const repository = yield* InvoiceRepository

    return {
      execute: (input: typeof CreateInvoiceRequest.Type) =>
        Effect.gen(function* () {
          const invoice = Invoice.create({
            amountCents: input.amountCents,
            date: input.date
          })

          return yield* repository.save(invoice)
        })
    }
  })
)
