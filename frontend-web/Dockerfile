# ── Stage 1: Build React ─────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Nhận API URL lúc build
ARG REACT_APP_API_URL=http://localhost:5105/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Copy package và install (cache)
COPY package*.json ./
RUN npm install

# Copy source và build
COPY . .
RUN npm run build

# ── Stage 2: Serve với Nginx ──────────────────────────────────
FROM nginx:alpine AS runtime

# Copy kết quả build
COPY --from=build /app/build /usr/share/nginx/html

# Copy config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]