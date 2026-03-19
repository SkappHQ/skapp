FROM node:20-alpine3.19 AS deps

WORKDIR /app
COPY package.json package-lock.json .npmrc* ./
RUN npm ci --force

FROM node:20-alpine3.19 AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN apk add --no-cache bash
RUN bash set-deploy-time.sh
RUN npm run build

FROM node:20-alpine3.19 AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
