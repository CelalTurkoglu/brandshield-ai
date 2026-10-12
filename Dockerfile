FROM node:20-alpine AS deps
WORKDIR /srv/brandshield
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /srv/brandshield
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY --from=deps /srv/brandshield/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /srv/brandshield
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
COPY --from=builder /srv/brandshield/.next ./.next
COPY --from=builder /srv/brandshield/public ./public
COPY --from=builder /srv/brandshield/package.json ./package.json
COPY --from=builder /srv/brandshield/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /srv/brandshield/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /srv/brandshield/next.config.ts ./next.config.ts
COPY --from=builder /srv/brandshield/node_modules ./node_modules
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec next start --hostname 0.0.0.0 --port ${PORT:-3000}"]
