import { HttpApi } from "@effect/platform"
import { InvoicesApi } from "./groups/invoices"

export class RentInvoiceApi extends HttpApi.make("rent-invoice-api")
  .add(InvoicesApi)
  .prefix("/api/v1")
{}
