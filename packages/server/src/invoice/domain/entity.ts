import { Schema } from "effect"

// Domain entity - pure business logic, no infrastructure dependencies
export class Invoice extends Schema.Class<Invoice>("Invoice")({
  id: Schema.UUID,
  amountCents: Schema.Number.pipe(Schema.int(), Schema.positive()),
  date: Schema.Date,
  createdAt: Schema.Date,
  updatedAt: Schema.Date,
  deletedAt: Schema.NullOr(Schema.Date)
}) {
  static create(props: {
    amountCents: number
    date: Date
  }) {
    return new Invoice({
      id: crypto.randomUUID(),
      amountCents: props.amountCents,
      date: props.date,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    })
  }

  isDeleted(): boolean {
    return this.deletedAt !== null
  }

  softDelete(): Invoice {
    return new Invoice({
      ...this,
      deletedAt: new Date(),
      updatedAt: new Date()
    })
  }

  update(props: {
    amountCents?: number
    date?: Date
  }): Invoice {
    return new Invoice({
      ...this,
      amountCents: props.amountCents ?? this.amountCents,
      date: props.date ?? this.date,
      updatedAt: new Date()
    })
  }
}
