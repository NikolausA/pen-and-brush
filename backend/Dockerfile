FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install
RUN apk add --no-cache postgresql-client

COPY . .
RUN mkdir -p dist && npm run build

EXPOSE 1221

CMD ["sh", "-c", "sleep 30 && npm start"]
