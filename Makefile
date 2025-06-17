# Family Points - Docker Management

.PHONY: help build up down dev prod logs clean restart

# Variables
COMPOSE_FILE = docker-compose.yml
COMPOSE_DEV_FILE = docker-compose.dev.yml

## help: Mostrar esta ayuda
help:
	@echo "📋 Family Points - Comandos Docker disponibles:"
	@echo ""
	@echo "🚀 Comandos de Producción:"
	@echo "  make build     - Construir imágenes de Docker"
	@echo "  make up        - Levantar servicios en modo producción"
	@echo "  make prod      - Construir y levantar servicios en producción"
	@echo ""
	@echo "🛠️  Comandos de Desarrollo:"
	@echo "  make dev       - Levantar servicios en modo desarrollo"
	@echo "  make dev-build - Construir y levantar servicios de desarrollo"
	@echo ""
	@echo "📊 Comandos de Monitoreo:"
	@echo "  make logs      - Ver logs de todos los servicios"
	@echo "  make status    - Ver estado de los contenedores"
	@echo ""
	@echo "🧹 Comandos de Limpieza:"
	@echo "  make down      - Detener todos los servicios"
	@echo "  make clean     - Limpiar contenedores e imágenes"
	@echo "  make restart   - Reiniciar todos los servicios"
	@echo ""
	@echo "🔧 Comandos Individuales:"
	@echo "  make backend   - Solo backend en desarrollo"
	@echo "  make frontend  - Solo frontend en desarrollo"

## build: Construir todas las imágenes
build:
	@echo "🔨 Construyendo imágenes de Docker..."
	docker-compose -f $(COMPOSE_FILE) build

## up: Levantar servicios en producción
up:
	@echo "🚀 Levantando servicios en modo producción..."
	docker-compose -f $(COMPOSE_FILE) up -d

## prod: Construir y levantar en producción
prod: build up
	@echo "✅ Servicios iniciados en modo producción"
	@echo "🌐 Frontend disponible en: http://localhost"
	@echo "🔧 Backend API disponible en: http://localhost:3000"
	@echo "📚 Documentación API: http://localhost:3000/api-docs"

## dev: Levantar servicios en desarrollo
dev:
	@echo "🛠️  Levantando servicios en modo desarrollo..."
	docker-compose -f $(COMPOSE_DEV_FILE) up -d

## dev-build: Construir y levantar en desarrollo
dev-build:
	@echo "🔨 Construyendo imágenes de desarrollo..."
	docker-compose -f $(COMPOSE_DEV_FILE) build
	@echo "🛠️  Levantando servicios en modo desarrollo..."
	docker-compose -f $(COMPOSE_DEV_FILE) up -d
	@echo "✅ Servicios iniciados en modo desarrollo"
	@echo "🌐 Frontend disponible en: http://localhost:4200"
	@echo "🔧 Backend API disponible en: http://localhost:3000"

## backend: Solo backend en desarrollo
backend:
	@echo "🔧 Iniciando solo backend..."
	docker-compose -f $(COMPOSE_DEV_FILE) up backend-dev -d

## frontend: Solo frontend en desarrollo
frontend:
	@echo "🌐 Iniciando solo frontend..."
	docker-compose -f $(COMPOSE_DEV_FILE) up frontend-dev -d

## logs: Ver logs de servicios
logs:
	@echo "📊 Mostrando logs de servicios..."
	docker-compose -f $(COMPOSE_FILE) logs -f

## logs-dev: Ver logs de desarrollo
logs-dev:
	@echo "📊 Mostrando logs de desarrollo..."
	docker-compose -f $(COMPOSE_DEV_FILE) logs -f

## status: Ver estado de contenedores
status:
	@echo "📊 Estado de contenedores:"
	docker-compose -f $(COMPOSE_FILE) ps

## down: Detener servicios
down:
	@echo "⬇️  Deteniendo servicios..."
	docker-compose -f $(COMPOSE_FILE) down
	docker-compose -f $(COMPOSE_DEV_FILE) down

## restart: Reiniciar servicios
restart: down up
	@echo "🔄 Servicios reiniciados"

## clean: Limpiar contenedores e imágenes
clean: down
	@echo "🧹 Limpiando contenedores e imágenes..."
	docker system prune -f
	docker volume prune -f
	@echo "✅ Limpieza completada"

## deep-clean: Limpieza profunda
deep-clean: down
	@echo "🧹 Limpieza profunda del sistema Docker..."
	docker system prune -af --volumes
	@echo "✅ Limpieza profunda completada"
