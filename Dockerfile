FROM oven/bun:1-alpine AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
COPY packages/server/package.json ./packages/server/
COPY packages/api/package.json ./packages/api/
COPY packages/api/src ./packages/api/src
RUN bun install --frozen-lockfile && \
    cd packages/server && bun install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production stage
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock* ./
COPY --from=builder /app/tsconfig.json ./

# Reinstall to fix Bun workspace symlinks in the container
RUN cd /app && bun install --frozen-lockfile

EXPOSE 3000

WORKDIR /app/packages/server
CMD ["bun", "run", "src/index.ts"]
