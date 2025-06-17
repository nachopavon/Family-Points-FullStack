# 🐳 Family Points - Docker Setup

Esta guía te ayudará a ejecutar Family Points usando Docker para un despliegue fácil y consistente.

## 📋 Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/install/) 2.0+
- Al menos 2GB de RAM libre
- Puertos 80 y 3000 disponibles

## 🚀 Inicio Rápido

### Modo Producción (Recomendado)

```bash
# Usando Makefile (si tienes Make instalado)
make prod

# O usando el script bash
./docker.sh prod

# O manualmente
docker-compose up --build -d
```

**Accesos:**
- 🌐 **Frontend**: http://localhost
- 🔧 **API Backend**: http://localhost:3000
- 📚 **Documentación API**: http://localhost:3000/api-docs

### Modo Desarrollo

```bash
# Usando Makefile
make dev-build

# O usando el script bash  
./docker.sh dev-build

# O manualmente
docker-compose -f docker-compose.dev.yml up --build -d
```

**Accesos:**
- 🌐 **Frontend**: http://localhost:4200 (con hot-reload)
- 🔧 **API Backend**: http://localhost:3000 (con nodemon)

## 📊 Monitoreo

```bash
# Ver estado de contenedores
make status
# o
./docker.sh status

# Ver logs en tiempo real
make logs
# o  
./docker.sh logs

# Ver logs solo de desarrollo
make logs-dev
```

## 🛠️ Comandos Útiles

### Gestión de Servicios

```bash
# Detener todos los servicios
make down
./docker.sh down

# Reiniciar servicios
make restart
./docker.sh restart

# Solo backend en desarrollo
make backend

# Solo frontend en desarrollo  
make frontend
```

### Limpieza

```bash
# Limpieza básica
make clean
./docker.sh clean

# Limpieza profunda (⚠️ elimina todo)
make deep-clean
```

## 🏗️ Arquitectura Docker

### Contenedores

1. **family-points-backend**
   - Node.js 20 Alpine
   - Puerto: 3000
   - Base de datos SQLite persistente
   - Variables de entorno configurables

2. **family-points-frontend**
   - Nginx Alpine (producción)
   - Puerto: 80 (prod) / 4200 (dev)
   - Proxy automático al backend
   - Angular con hot-reload en desarrollo

### Volúmenes

- `backend_data`: Persistencia de base de datos SQLite
- `backend_dev_data`: Datos de desarrollo separados

### Red

- `family-points-network`: Red bridge interna
- `family-points-dev-network`: Red de desarrollo

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Backend
NODE_ENV=production
JWT_SECRET=tu-secreto-jwt-super-seguro
PORT=3000
DB_PATH=/app/data/database.sqlite

# CORS (opcional)
CORS_ORIGIN=http://localhost

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Personalización de Puertos

Edita `docker-compose.yml` para cambiar puertos:

```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Frontend en puerto 8080
  backend:
    ports:
      - "3001:3000"  # Backend en puerto 3001
```

## 🐛 Solución de Problemas

### Error: Puerto ya en uso

```bash
# Verificar qué está usando el puerto
sudo lsof -i :80
sudo lsof -i :3000

# Detener servicios conflictivos
make down
```

### Error: Sin espacio en disco

```bash
# Limpiar Docker
make clean
docker system df  # Ver uso de espacio
```

### Error: Permisos de base de datos

```bash
# Verificar permisos del volumen
docker volume inspect test-copilot-backend_backend_data

# Recrear volumen si es necesario
docker volume rm test-copilot-backend_backend_data
make prod
```

### Logs de debugging

```bash
# Logs detallados de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Acceso directo al contenedor
docker exec -it family-points-backend sh
docker exec -it family-points-frontend sh
```

## 🔧 Desarrollo Avanzado

### Desarrollo con volúmenes montados

El modo desarrollo monta el código fuente como volúmenes, permitiendo:
- ✅ Hot-reload automático
- ✅ Cambios en tiempo real
- ✅ Debugging con sourcemaps
- ✅ Instalación de dependencias persistente

### Build de producción personalizado

```bash
# Build solo del backend
docker build -t family-points-backend ./backend

# Build solo del frontend
docker build -t family-points-frontend ./frontend

# Build multi-arquitectura
docker buildx build --platform linux/amd64,linux/arm64 -t family-points ./backend
```

## 📦 Despliegue

### Docker Hub

```bash
# Tag y push
docker tag family-points-backend tu-usuario/family-points-backend:latest
docker push tu-usuario/family-points-backend:latest

docker tag family-points-frontend tu-usuario/family-points-frontend:latest
docker push tu-usuario/family-points-frontend:latest
```

### Servidor de producción

```bash
# En el servidor
git clone tu-repositorio
cd family-points
cp .env.example .env  # Configurar variables
make prod
```

## 🆘 Soporte

Si encuentras problemas:

1. Verifica que Docker esté ejecutándose: `docker --version`
2. Revisa los logs: `make logs`
3. Limpia y reinicia: `make clean && make prod`
4. Consulta la documentación oficial de Docker

---

**💡 Tip**: Usa `make help` o `./docker.sh help` para ver todos los comandos disponibles.
