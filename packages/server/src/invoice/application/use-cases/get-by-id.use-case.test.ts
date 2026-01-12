import { describe, test, expect } from "bun:test"
import { Effect, Layer, Exit } from "effect"
import { GetByIdUseCase, GetByIdUseCaseLive } from "./get-by-id.use-case"
import { InvoiceRepository } from "../ports/repository.port"
import { Invoice } from "../../domain/entity"
import { InvoiceNotFoundError, InvalidInvoiceError } from "api/schemas/invoice"

describe("GetByIdUseCase", () => {
  test("returns invoice when found", async () => {
    const invoice = Invoice.create({ amountCents: 15000, date: new Date("2024-01-15") })

    const mockRepo = Layer.succeed(InvoiceRepository, {
      save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
      findById: (id: string) => {
        if (id === invoice.id) {
          return Effect.succeed(invoice)
        }
        return Effect.fail(new InvoiceNotFoundError({ id }))
      },
      findAll: () => Effect.succeed({ invoices: [], total: 0 }),
      update: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" }))
    })

    const testLayer = GetByIdUseCaseLive.pipe(Layer.provide(mockRepo))

    const result = await Effect.gen(function* () {
      const useCase = yield* GetByIdUseCase
      return yield* useCase.execute(invoice.id)
    }).pipe(Effect.provide(testLayer), Effect.runPromise)

    expect(result.id).toBe(invoice.id)
    expect(result.amountCents).toBe(15000)
    expect(result.date).toEqual(new Date("2024-01-15"))
  })

  test("fails when invoice not found", async () => {
    const notFoundId = crypto.randomUUID()
    const mockRepo = Layer.succeed(InvoiceRepository, {
      save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
      findById: () => Effect.fail(new InvoiceNotFoundError({ id: notFoundId })),
      findAll: () => Effect.succeed({ invoices: [], total: 0 }),
      update: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" }))
    })

    const testLayer = GetByIdUseCaseLive.pipe(Layer.provide(mockRepo))

    const result = await Effect.gen(function* () {
      const useCase = yield* GetByIdUseCase
      return yield* useCase.execute(notFoundId)
    }).pipe(Effect.provide(testLayer), Effect.runPromiseExit)

    expect(Exit.isFailure(result)).toBe(true)
  })

  test("returns correct invoice for different IDs", async () => {
    const invoice1 = Invoice.create({ amountCents: 5000, date: new Date() })
    const invoice2 = Invoice.create({ amountCents: 7500, date: new Date() })

    const mockRepo = Layer.succeed(InvoiceRepository, {
      save: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" })),
      findById: (id: string) => {
        if (id === invoice1.id) return Effect.succeed(invoice1)
        if (id === invoice2.id) return Effect.succeed(invoice2)
        return Effect.fail(new InvoiceNotFoundError({ id }))
      },
      findAll: () => Effect.succeed({ invoices: [], total: 0 }),
      update: () => Effect.fail(new InvalidInvoiceError({ message: "Invalid" }))
    })

    const testLayer = GetByIdUseCaseLive.pipe(Layer.provide(mockRepo))

    const result1 = await Effect.gen(function* () {
      const useCase = yield* GetByIdUseCase
      return yield* useCase.execute(invoice1.id)
    }).pipe(Effect.provide(testLayer), Effect.runPromise)

    const result2 = await Effect.gen(function* () {
      const useCase = yield* GetByIdUseCase
      return yield* useCase.execute(invoice2.id)
    }).pipe(Effect.provide(testLayer), Effect.runPromise)

    expect(result1.id).toBe(invoice1.id)
    expect(result1.amountCents).toBe(5000)
    expect(result2.id).toBe(invoice2.id)
    expect(result2.amountCents).toBe(7500)
  })
})
