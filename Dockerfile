# Сборка фронтенда
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь исходный код
COPY . .

# ARG для передачи VITE_API_URL при сборке
ARG VITE_API_URL=http://158.160.167.237:8080
ENV VITE_API_URL=$VITE_API_URL

# Создаем .env для Vite на основе переданного ARG
RUN echo "VITE_API_URL=$VITE_API_URL" > .env

# Собираем приложение (Vite подставит VITE_API_URL в бандл)
RUN npm run build

# Продакшен: раздача статики через nginx
FROM nginx:alpine AS app

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Конфигурация nginx для SPA
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
