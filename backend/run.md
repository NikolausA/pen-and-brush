# 1. Создайте сеть
docker network create app-network

# 2. Запустите контейнер базы данных
docker run -d \
  --name db-container \
  --network app-network \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=graphic_editor \
  -v db-data:/var/lib/postgresql/data \
  -v $(pwd)/db/init.sql:/docker-entrypoint-initdb.d/init.sql \
  --health-cmd="pg_isready -U user -d graphic_editor || exit 1" \
  --health-interval=5s \
  --health-timeout=5s \
  --health-retries=10 \
  postgres:16-alpine

# 3. Соберите бэкенд-образ
cd backend
docker build -t image1 .

# 4. Запустите бэкенд-контейнер
docker run -d \
  --name backend-container \
  --network app-network \
  -p 1221:1221 \
  -e NODE_ENV=production \
  -e DB_HOST=db-container \
  -e DB_PORT=5432 \
  -e DB_USER=user \
  -e DB_PASSWORD=password \
  -e DB_NAME=graphic_editor \
  --health-cmd="curl -f http://localhost:1221/health || exit 1" \
  --health-interval=10s \
  --health-timeout=5s \
  --health-retries=5 \
  image1

ДЛЯ КОРРЕКТНОЙ РАБОТЫ ПРОВЕРЬТЕ ОБЯЗАТЕЛЬНО

что запущен db-container и backend-container 

# 5. (Опционально) Соберите и запустите фронтенд
cd ../frontend
docker build -t frontend-image .
docker run -d \
  --name frontend-container \
  --network app-network \
  -p 1331:1331 \
  frontend-image

# 6. Проверка
docker ps
docker logs backend-container
curl http://localhost:1221/health
curl http://localhost:1331