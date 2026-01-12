import { describe, test, expect } from "bun:test"
import { Invoice } from "./entity"

describe("Invoice", () => {
  describe("create", () => {
    test("creates valid invoice with required fields", () => {
      const date = new Date("2024-01-15")
      const invoice = Invoice.create({
        amountCents: 10000,
        date
      })

      expect(invoice.amountCents).toBe(10000)
      expect(invoice.date).toEqual(date)
      expect(invoice.id).toBeDefined()
      expect(invoice.createdAt).toBeInstanceOf(Date)
      expect(invoice.updatedAt).toBeInstanceOf(Date)
      expect(invoice.deletedAt).toBeNull()
    })

    test("generates unique IDs", () => {
      const invoice1 = Invoice.create({ amountCents: 5000, date: new Date() })
      const invoice2 = Invoice.create({ amountCents: 5000, date: new Date() })

      expect(invoice1.id).not.toBe(invoice2.id)
    })

    test("throws on negative amount", () => {
      expect(() => {
        Invoice.create({ amountCents: -100, date: new Date() })
      }).toThrow()
    })

    test("throws on zero amount", () => {
      expect(() => {
        Invoice.create({ amountCents: 0, date: new Date() })
      }).toThrow()
    })

    test("throws on non-integer amount", () => {
      expect(() => {
        Invoice.create({ amountCents: 100.5, date: new Date() })
      }).toThrow()
    })
  })

  describe("update", () => {
    test("updates amount", () => {
      const original = Invoice.create({ amountCents: 5000, date: new Date() })
      const updated = original.update({ amountCents: 7500 })

      expect(updated.amountCents).toBe(7500)
      expect(updated.date).toEqual(original.date)
      expect(updated.id).toBe(original.id)
      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(original.updatedAt.getTime())
    })

    test("updates date", () => {
      const original = Invoice.create({ amountCents: 5000, date: new Date("2024-01-01") })
      const newDate = new Date("2024-02-01")
      const updated = original.update({ date: newDate })

      expect(updated.date).toEqual(newDate)
      expect(updated.amountCents).toBe(original.amountCents)
      expect(updated.id).toBe(original.id)
    })

    test("updates both fields", () => {
      const original = Invoice.create({ amountCents: 5000, date: new Date("2024-01-01") })
      const newDate = new Date("2024-02-01")
      const updated = original.update({ amountCents: 8000, date: newDate })

      expect(updated.amountCents).toBe(8000)
      expect(updated.date).toEqual(newDate)
    })

    test("preserves other fields when updating", () => {
      const original = Invoice.create({ amountCents: 5000, date: new Date() })
      const updated = original.update({ amountCents: 6000 })

      expect(updated.createdAt).toEqual(original.createdAt)
      expect(updated.deletedAt).toBe(original.deletedAt)
    })
  })

  describe("softDelete", () => {
    test("sets deletedAt timestamp", () => {
      const invoice = Invoice.create({ amountCents: 5000, date: new Date() })
      const deleted = invoice.softDelete()

      expect(deleted.deletedAt).toBeInstanceOf(Date)
      expect(deleted.deletedAt).not.toBeNull()
    })

    test("updates updatedAt timestamp", () => {
      const invoice = Invoice.create({ amountCents: 5000, date: new Date() })
      const deleted = invoice.softDelete()

      expect(deleted.updatedAt.getTime()).toBeGreaterThanOrEqual(invoice.updatedAt.getTime())
    })

    test("preserves other fields", () => {
      const invoice = Invoice.create({ amountCents: 5000, date: new Date() })
      const deleted = invoice.softDelete()

      expect(deleted.id).toBe(invoice.id)
      expect(deleted.amountCents).toBe(invoice.amountCents)
      expect(deleted.date).toEqual(invoice.date)
      expect(deleted.createdAt).toEqual(invoice.createdAt)
    })
  })

  describe("isDeleted", () => {
    test("returns false for active invoice", () => {
      const invoice = Invoice.create({ amountCents: 5000, date: new Date() })
      expect(invoice.isDeleted()).toBe(false)
    })

    test("returns true for deleted invoice", () => {
      const invoice = Invoice.create({ amountCents: 5000, date: new Date() })
      const deleted = invoice.softDelete()
      expect(deleted.isDeleted()).toBe(true)
    })
  })
})
