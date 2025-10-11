NODE_ENV=development
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=1221
PREFIX=0
PROD_DB_HOST=test.com
PROD_DB_PORT=
PROD_DB_USER=
PROD_DB_PASSWORD=
PROD_DB_NAME=
PROD_PORT=
PROD_FRONTEND_URL=

all: help

help:
	@echo "Available commands:"
	@echo "  make build        - Copy source files to dist directory"
	@echo "  make start        - Start the built application"
	@echo "  make dev          - Run the application in development mode with nodemon"
	@echo "  make test         - Run tests (currently a placeholder)"
	@echo "  make clean        - Clean the dist directory"
	@echo "  make prod         - Build and start the application in production mode"

build:
	@mkdir -p dist
	@cp -r src/* dist/
	@echo "Files copied to dist"

start:
	@NODE_ENV=$(NODE_ENV) PORT=$(PORT) DB_HOST=$(DB_HOST) DB_PORT=$(DB_PORT) DB_USER=$(DB_USER) DB_PASSWORD=$(DB_PASSWORD) DB_NAME=$(DB_NAME) node dist/app.js

dev:
	@NODE_ENV=$(NODE_ENV) PORT=$(PORT) DB_HOST=$(DB_HOST) DB_PORT=$(DB_PORT) DB_USER=$(DB_USER) DB_PASSWORD=$(DB_PASSWORD) DB_NAME=$(DB_NAME) nodemon dist/app.js

test:
	@echo "Error: No tests specified"
	@exit 1

clean:
	@rm -rf dist

prod: build
	@NODE_ENV=production PORT=$(PROD_PORT) DB_HOST=$(PROD_DB_HOST) DB_PORT=$(PROD_DB_PORT) DB_USER=$(PROD_DB_USER) DB_PASSWORD=$(PROD_DB_PASSWORD) DB_NAME=$(PROD_DB_NAME) PROD_FRONTEND_URL=$(PROD_FRONTEND_URL) node dist/app.js

.PHONY: all help build start dev test clean prod