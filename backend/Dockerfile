# Backend Dockerfile - Family Points API
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache sqlite

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear directorio para la base de datos
RUN mkdir -p /app/data

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV JWT_SECRET=family-points-secret-docker
ENV DB_PATH=/app/data/database.sqlite
ENV PORT=3000

# Comando de inicio
CMD ["node", "src/index.js"]
