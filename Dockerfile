# -------- Base --------
FROM node:20-alpine AS base
WORKDIR /app
RUN corepack enable

# -------- Dependencies --------
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# -------- Build --------
FROM base AS builder

ARG NEXT_PUBLIC_BACKEND_API_URL
ARG BACKEND_API_URL

ENV NEXT_PUBLIC_BACKEND_API_URL=$NEXT_PUBLIC_BACKEND_API_URL
ENV BACKEND_API_URL=$BACKEND_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# -------- Runner --------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

ENV CF_ACCESS_CLIENT_ID=""
ENV CF_ACCESS_CLIENT_SECRET=""

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 8080

CMD ["node", "server.js"]