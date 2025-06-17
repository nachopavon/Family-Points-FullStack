#!/bin/bash

# Family Points - Docker Management Script
# Alternativa a Makefile para sistemas sin Make

set -e

COMPOSE_FILE="docker-compose.yml"
COMPOSE_DEV_FILE="docker-compose.dev.yml"

show_help() {
    echo "📋 Family Points - Comandos Docker disponibles:"
    echo ""
    echo "🚀 Comandos de Producción:"
    echo "  ./docker.sh build     - Construir imágenes de Docker"
    echo "  ./docker.sh up        - Levantar servicios en modo producción"
    echo "  ./docker.sh prod      - Construir y levantar servicios en producción"
    echo ""
    echo "🛠️  Comandos de Desarrollo:"
    echo "  ./docker.sh dev       - Levantar servicios en modo desarrollo"
    echo "  ./docker.sh dev-build - Construir y levantar servicios de desarrollo"
    echo ""
    echo "📊 Comandos de Monitoreo:"
    echo "  ./docker.sh logs      - Ver logs de todos los servicios"
    echo "  ./docker.sh status    - Ver estado de los contenedores"
    echo ""
    echo "🧹 Comandos de Limpieza:"
    echo "  ./docker.sh down      - Detener todos los servicios"
    echo "  ./docker.sh clean     - Limpiar contenedores e imágenes"
    echo "  ./docker.sh restart   - Reiniciar todos los servicios"
}

build_images() {
    echo "🔨 Construyendo imágenes de Docker..."
    docker-compose -f "$COMPOSE_FILE" build
}

start_production() {
    echo "🚀 Levantando servicios en modo producción..."
    docker-compose -f "$COMPOSE_FILE" up -d
}

start_prod_complete() {
    build_images
    start_production
    echo "✅ Servicios iniciados en modo producción"
    echo "🌐 Frontend disponible en: http://localhost"
    echo "🔧 Backend API disponible en: http://localhost:3000"
    echo "📚 Documentación API: http://localhost:3000/api-docs"
}

start_dev() {
    echo "🛠️  Levantando servicios en modo desarrollo..."
    docker-compose -f "$COMPOSE_DEV_FILE" up -d
}

start_dev_complete() {
    echo "🔨 Construyendo imágenes de desarrollo..."
    docker-compose -f "$COMPOSE_DEV_FILE" build
    echo "🛠️  Levantando servicios en modo desarrollo..."
    docker-compose -f "$COMPOSE_DEV_FILE" up -d
    echo "✅ Servicios iniciados en modo desarrollo"
    echo "🌐 Frontend disponible en: http://localhost:4200"
    echo "🔧 Backend API disponible en: http://localhost:3000"
}

show_logs() {
    echo "📊 Mostrando logs de servicios..."
    docker-compose -f "$COMPOSE_FILE" logs -f
}

show_status() {
    echo "📊 Estado de contenedores:"
    docker-compose -f "$COMPOSE_FILE" ps
}

stop_services() {
    echo "⬇️  Deteniendo servicios..."
    docker-compose -f "$COMPOSE_FILE" down
    docker-compose -f "$COMPOSE_DEV_FILE" down
}

restart_services() {
    stop_services
    start_production
    echo "🔄 Servicios reiniciados"
}

clean_docker() {
    stop_services
    echo "🧹 Limpiando contenedores e imágenes..."
    docker system prune -f
    docker volume prune -f
    echo "✅ Limpieza completada"
}

case "$1" in
    "help"|"-h"|"--help"|"")
        show_help
        ;;
    "build")
        build_images
        ;;
    "up")
        start_production
        ;;
    "prod")
        start_prod_complete
        ;;
    "dev")
        start_dev
        ;;
    "dev-build")
        start_dev_complete
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "down")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "clean")
        clean_docker
        ;;
    *)
        echo "❌ Comando no reconocido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
