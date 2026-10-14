FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci --workspace frontend --include-workspace-root=false

COPY frontend ./frontend
RUN npm run build --workspace frontend

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/frontend/dist ./frontend/dist
COPY frontend/server.mjs ./frontend/server.mjs
ENV NODE_ENV=production PORT=8080
EXPOSE 8080
CMD ["node", "frontend/server.mjs"]
