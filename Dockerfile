FROM node:22-slim AS build
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/dist ./dist

RUN pnpm install --prod --frozen-lockfile \
  && chown -R node:node /app

USER node
EXPOSE 3000

CMD ["node", "dist/main.js"]
