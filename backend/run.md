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

# 3. Ждем готовности базы данных

echo "Ждем готовности базы данных..."
while [ "$(docker inspect --format='{{.State.Health.Status}}' db-container)" != "healthy" ]; do
echo "БД еще не готова, ждем..."
sleep 2
done
echo "БД готова!"

# 4. Соберите бэкенд-образ

cd backend
docker build -t image1 .

docker run -d \
 --name backend-container \
 --network app-network \
 -p 1221:80 \
 -e NODE_ENV=production \
 -e DB_HOST=db-container \
 -e DB_PORT=5432 \
 -e DB_USER=user \
 -e DB_PASSWORD=password \
 -e DB_NAME=graphic_editor \
 -e PORT=80 \
 --health-cmd="curl -f http://localhost:80/test || exit 1" \
 --health-interval=10s \
 --health-timeout=5s \
 --health-retries=5 \
 image1

# 5. Ждем готовности бэкенда

echo "Ждем готовности бэкенда..."
while [ "$(docker inspect --format='{{.State.Health.Status}}' backend-container)" != "healthy" ]; do
echo "Бэкенд еще не готов, ждем..."
sleep 2
done
echo "Бэкенд готов!"

# 6. (Опционально) Соберите и запустите фронтенд

cd ../frontend
docker build -t frontend-image .
docker run -d \
 --name frontend-container \
 --network app-network \
 -p 1331:1331 \
 frontend-image

# 7. Проверка

docker ps
echo "Проверяем логи бэкенда:"
docker logs backend-container

echo "Тестируем подключение:"

# Для варианта A (приложение на порту 80):

curl http://localhost:1221/test
curl http://localhost:1221/api/projects

# Для варианта B (приложение на порту 1221):

# curl http://localhost:1221/health

# curl http://localhost:1221/api/projects

# Проверяем фронтенд (если запущен):

# curl http://localhost:1331

# 9. Дополнительная диагностика при проблемах

echo "Дополнительная диагностика:"
echo "Проверяем, какие порты слушает бэкенд:"
docker exec backend-container netstat -tlnp 2>/dev/null || docker exec backend-container ss -tlnp

echo "Проверяем подключение к БД изнутри бэкенда:"
docker exec backend-container ping db-container -c 1

echo "Проверяем переменные окружения:"
docker exec backend-container env | grep -E "(PORT|DB\_)"
