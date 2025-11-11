# Use Node.js LTS version
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm ci

# Build shared package
FROM base AS shared-builder
WORKDIR /app
COPY packages/shared ./packages/shared
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
RUN cd packages/shared && npm run build

# Build backend
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=shared-builder /app/packages/shared ./packages/shared
COPY apps/backend ./apps/backend
COPY package.json ./

# Build TypeScript
WORKDIR /app/apps/backend
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/apps/backend/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=shared-builder --chown=nodejs:nodejs /app/packages/shared ./node_modules/@productivity-assistant/shared

USER nodejs

EXPOSE 4000

ENV PORT 4000

CMD ["node", "dist/index.js"]
