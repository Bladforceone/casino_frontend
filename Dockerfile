# Сборка фронтенда
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# ARG для передачи VITE_API_URL при сборке (из .env через docker-compose или --build-arg)
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

# Сборка приложения (Vite подставит VITE_API_URL в бандл)
RUN npm run build

# Продакшен: раздача статики через nginx
FROM nginx:alpine

# Копируем собранное приложение из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Базовая конфигурация nginx для SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        return 200 "OK"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
