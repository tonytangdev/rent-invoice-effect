import { pgTable, uuid, integer, timestamp } from "drizzle-orm/pg-core"

export const invoicesTable = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  amountCents: integer("amount_cents").notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at")
})

export type Invoice = typeof invoicesTable.$inferSelect
export type NewInvoice = typeof invoicesTable.$inferInsert
