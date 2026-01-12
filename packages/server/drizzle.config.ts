import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/invoice/infrastructure/persistence/schema.ts',
  out: './src/invoice/infrastructure/persistence/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/rent_invoice',
  },
});
