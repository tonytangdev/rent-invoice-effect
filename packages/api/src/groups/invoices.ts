import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform"
import * as InvoiceSchema from "../schemas/invoice"

// Use separate id schema for path param
const idParam = HttpApiSchema.param("id", InvoiceSchema.InvoiceId)

export class InvoicesApi extends HttpApiGroup.make("invoices")
  .add(
    HttpApiEndpoint.post("create", "/")
      .setPayload(InvoiceSchema.CreateInvoiceRequest)
      .addSuccess(InvoiceSchema.Invoice)
      .addError(InvoiceSchema.InvalidInvoiceError, { status: 400 })
  )
  .add(
    HttpApiEndpoint.get("getById")`/${idParam}`
      .addSuccess(InvoiceSchema.Invoice)
      .addError(InvoiceSchema.InvoiceNotFoundError, { status: 404 })
  )
  .add(
    HttpApiEndpoint.get("list", "/")
      .setUrlParams(InvoiceSchema.ListInvoicesQuery)
      .addSuccess(InvoiceSchema.InvoiceList)
  )
  .add(
    HttpApiEndpoint.patch("update")`/${idParam}`
      .setPayload(InvoiceSchema.UpdateInvoiceRequest)
      .addSuccess(InvoiceSchema.Invoice)
      .addError(InvoiceSchema.InvoiceNotFoundError, { status: 404 })
      .addError(InvoiceSchema.InvalidInvoiceError, { status: 400 })
  )
  .prefix("/invoices")
{}
