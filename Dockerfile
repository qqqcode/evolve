# 构建阶段
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY evolve/src ./evolve/src
COPY evolve2/src ./evolve2/src
COPY legion/src ./legion/src
RUN npm run build

# 运行阶段
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY public ./public
COPY evolve/public ./evolve/public
COPY evolve2/public ./evolve2/public
COPY legion/public ./legion/public

EXPOSE 3000

USER node
CMD ["node", "dist/src/server.js"]
