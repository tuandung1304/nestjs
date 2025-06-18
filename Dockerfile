FROM node:20-alpine AS base

ARG PORT=3000

ENV PORT=$PORT

# dependencies stage
FROM base AS dependencies

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

# build stage
FROM base AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN yarn build

# runner stage
FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
RUN yarn install --frozen-lockfile --production && yarn cache clean

EXPOSE $PORT

CMD ["node", "dist/main"]