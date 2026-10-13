# ==========================================
# STAGE 1: Base Dependencies
# ==========================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install libc6-compat for Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
COPY prisma ./prisma/

RUN npm ci

# ==========================================
# STAGE 2: Build Application
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Pastikan folder public ada agar tidak error saat COPY
RUN mkdir -p /app/public

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js Application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ==========================================
# STAGE 3: Production Runner
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install openssl for Prisma runtime
RUN apk add --no-cache openssl libc6-compat

# Security: Run as non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential runtime files
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/data ./data
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next_app ./.next_app

# Set correct permissions
USER nextjs

EXPOSE 3000

CMD ["node", "node_modules/next/dist/bin/next", "start", "-d", ".next_app"]
