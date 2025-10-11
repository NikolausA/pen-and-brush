FROM node:20-alpine

WORKDIR /app

# Установка зависимостей
COPY package.json .
RUN npm install
RUN apk add --no-cache postgresql-client

# Копирование исходного кода
COPY . .

# Создание папки config, если её нет
RUN mkdir -p config

EXPOSE 1221

# Запуск с небольшой задержкой для ожидания базы данных
CMD ["sh", "-c", "sleep 30 && npm start"]