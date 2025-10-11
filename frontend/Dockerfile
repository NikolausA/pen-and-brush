FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install
RUN npm install --global http-server

COPY . .
RUN npm run build

EXPOSE 1331
CMD ["http-server", "dist", "-p", "1331"]