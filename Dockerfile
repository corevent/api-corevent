FROM node:22-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.0.8 --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter=api-corevent build:standalone

FROM gcr.io/distroless/nodejs22-debian12 AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist/index.js ./index.js

USER 65532
EXPOSE 3000

CMD ["index.js"]