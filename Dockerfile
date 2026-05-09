FROM node:22-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.0.8 --activate
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./  

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build
RUN pnpm prune --prod

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main"]