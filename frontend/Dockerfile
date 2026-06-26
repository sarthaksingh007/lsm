FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE=http://localhost:5100/api
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/next.config.mjs ./
EXPOSE 3100
CMD ["npx", "next", "start", "-p", "3100"]
