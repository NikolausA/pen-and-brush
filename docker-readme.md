# 🚀 Запуск проекта в Docker

## 📦 Подготовка

Убедись, что у тебя установлены:

* **Docker** (>= 20.x)
* **Docker Compose** (>= 2.x)

---

## ▶️ Первый запуск

1. Остановить и удалить контейнеры + volume базы (чтобы пересоздалась схема):

   ```bash
   docker-compose down -v
   ```
2. Собрать и запустить проект:

   ```bash
   docker-compose up -d --build
   ```
3. Проверить, что контейнеры запустились:

   ```bash
   docker ps
   ```

---

## 🌐 Сервисы

* **Backend**: [http://localhost:1221](http://localhost:1221)
  Swagger доступен по адресу: [http://localhost:1221/api-docs](http://localhost:1221/api-docs)

* **Frontend**: [http://localhost:1331](http://localhost:1331)

* **Postgres**: доступен только внутри docker сети как `db:5432`.
  Чтобы подключиться с локальной машины, нужно пробросить порт (добавить `5432:5432` в `docker-compose.yaml`).

---

## 🛠 Работа с базой

Подключиться внутрь контейнера:

```bash
docker exec -it <имя_контейнера_db> psql -U u -d graphic_editor
```

Посмотреть список таблиц:

```sql
\dt
```

---

## 🔄 Пересоздание базы

Если нужно применить изменения в `init.sql` или пересоздать структуру:

```bash
docker-compose down -v
docker-compose up -d --build
```

---

## 📝 Переменные окружения

### Backend использует:

* `NODE_ENV=production`
* (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`)

### Postgres использует:

* `POSTGRES_USER=user`
* `POSTGRES_PASSWORD=password`
* `POSTGRES_DB=graphic_editor`

---

## 🧹 Также полезные команды

* Логи backend:

  ```bash
  docker-compose logs -f backend
  ```
* Логи frontend:

  ```bash
  docker-compose logs -f frontend
  ```
* Логи базы:

  ```bash
  docker-compose logs -f db
  ```
