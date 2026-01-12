import { Schema } from "effect";

// Separate id schema
export const InvoiceId = Schema.UUID;

export class Invoice extends Schema.Class<Invoice>("Invoice")({
	id: InvoiceId,
	amountCents: Schema.Number.pipe(Schema.int(), Schema.positive()),
	date: Schema.Date,
	createdAt: Schema.Date,
	updatedAt: Schema.Date,
	deletedAt: Schema.NullOr(Schema.Date),
}) {}

// No id - server generates
export class CreateInvoiceRequest extends Schema.Class<CreateInvoiceRequest>(
	"CreateInvoiceRequest",
)({
	amountCents: Schema.Number.pipe(Schema.int(), Schema.positive()),
	date: Schema.Date,
}) {}

export class UpdateInvoiceRequest extends Schema.Class<UpdateInvoiceRequest>(
	"UpdateInvoiceRequest",
)({
	amountCents: Schema.optional(
		Schema.Number.pipe(Schema.int(), Schema.positive()),
	),
	date: Schema.optional(Schema.Date),
}) {}

export class ListInvoicesQuery extends Schema.Class<ListInvoicesQuery>(
	"ListInvoicesQuery",
)({
	limit: Schema.NumberFromString.pipe(
		Schema.int(),
		Schema.positive(),
		Schema.optionalWith({ default: () => 20 }),
	),
	offset: Schema.NumberFromString.pipe(
		Schema.int(),
		Schema.nonNegative(),
		Schema.optionalWith({ default: () => 0 }),
	),
}) {}

export class InvoiceList extends Schema.Class<InvoiceList>("InvoiceList")({
	invoices: Schema.Array(Invoice),
	total: Schema.Number.pipe(Schema.int()),
}) {}

export class InvoiceNotFoundError extends Schema.TaggedError<InvoiceNotFoundError>()(
	"InvoiceNotFoundError",
	{ id: InvoiceId },
) {}

export class InvalidInvoiceError extends Schema.TaggedError<InvalidInvoiceError>()(
	"InvalidInvoiceError",
	{ message: Schema.String },
) {}

export class TransientDatabaseError extends Schema.TaggedError<TransientDatabaseError>()(
	"TransientDatabaseError",
	{ message: Schema.String },
) {}
