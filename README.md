# 🏠 Family Points - Fullstack Application

**Sistema completo de gestión de tareas familiares con puntos de recompensa**

Aplicación fullstack desarrollada con **Angular** (frontend) y **Node.js + Express + SQLite** (backend) para gestionar tareas familiares, miembros de familia, puntos de recompensa y sistema de autenticación.

## 🎯 Descripción

Family Points es una aplicación web completa que permite a las familias gestionar tareas domésticas mediante un sistema de puntos y recompensas. Los padres pueden crear tareas, asignar puntos y ver el progreso de cada miembro de la familia en tiempo real.

## ✨ Características

### 🖥️ **Frontend (Angular)**
- 🎨 **UI Moderna** - Interfaz responsiva y atractiva
- 🔐 **Autenticación** - Login/registro con guards
- 👨‍👩‍👧‍👦 **Gestión de Familia** - CRUD de miembros familiares
- 📋 **Sistema de Tareas** - Crear, asignar y completar tareas
- 🏆 **Leaderboard** - Tabla de clasificación en tiempo real
- 📱 **Responsive** - Funciona en móviles y tablets
- ⚡ **Tiempo Real** - Actualizaciones automáticas

### 🔧 **Backend (Node.js + Express)**
- 🔐 **API REST** - Endpoints completos con autenticación JWT
- 📊 **Base de datos SQLite** - Persistencia ligera con relaciones FK
- 📚 **Documentación Swagger** - API docs automática
- 🛡️ **Seguridad** - Helmet, CORS, rate limiting, bcrypt
- ✅ **Validación** - Esquemas Joi robustos
- 🎭 **Datos Demo** - Usuario de prueba preconfigurado

## 📁 Estructura del Proyecto

```
family-points/
├── backend/                 # 🔧 API Node.js + Express + SQLite
│   ├── src/
│   │   ├── controllers/     # 🎮 Lógica de negocio
│   │   ├── models/         # 🗄️ Modelos de datos SQLite
│   │   ├── routes/         # 🛣️ Endpoints de la API
│   │   ├── middleware/     # ⚙️ Autenticación y validación
│   │   ├── validators/     # ✅ Esquemas de validación
│   │   └── database/       # 🔧 Configuración de BD
│   ├── package.json
│   └── database.sqlite
├── frontend/               # 🖥️ Aplicación Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/ # 🎨 Componentes UI
│   │   │   ├── services/   # 🔄 Servicios HTTP
│   │   │   └── models/     # 📋 Interfaces TypeScript
│   │   └── assets/
│   ├── angular.json
│   └── package.json
├── package.json            # 📦 Scripts del proyecto completo
└── README.md              # 📖 Este archivo
```

## 🚀 Inicio Rápido

### 📋 **Requisitos**
- **Node.js** >= 18.0.0
- **Angular CLI** >= 17.0.0
- **npm** o **yarn**

### ⚡ **Instalación Completa**

```bash
# Clonar el repositorio
git clone <repository-url>
cd family-points

# Instalar dependencias de ambos proyectos
npm run install:all

# Ejecutar ambos proyectos simultáneamente
npm run dev
```

### 🔧 **Instalación Manual (Paso a Paso)**

#### 1. **Backend (API)**
```bash
# Instalar dependencias del backend
cd backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env según necesidades

# Iniciar servidor backend
npm start
```

#### 2. **Frontend (Angular)**
```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Iniciar servidor de desarrollo
ng serve
```

## 🌐 **URLs de Acceso**

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:4200 | 🖥️ Aplicación web principal |
| **Backend API** | http://localhost:3000/api | 🔧 API REST |
| **Swagger Docs** | http://localhost:3000/api-docs | 📚 Documentación interactiva |
| **Health Check** | http://localhost:3000/api/health | ❤️ Estado de la API |

## 📋 **Scripts Disponibles**

```bash
# 🔧 Instalación
npm run install:backend     # Instalar solo backend
npm run install:frontend    # Instalar solo frontend  
npm run install:all         # Instalar ambos proyectos

# 🚀 Desarrollo
npm run start:backend       # Ejecutar solo backend
npm run start:frontend      # Ejecutar solo frontend
npm run dev                 # Ejecutar ambos simultáneamente

# 🏗️ Build & Deploy
npm run build:frontend      # Build de producción Angular
npm run build:all          # Build completo

# 🧪 Testing
npm run test:backend        # Tests del backend
npm run test:frontend       # Tests del frontend
npm run test:all           # Tests de ambos proyectos

# 🧹 Limpieza
npm run clean              # Limpiar node_modules y builds
```

## 🧪 **Datos de Prueba**

El sistema incluye datos demo preconfigurados para pruebas:

### 👤 **Usuario Demo**
- **Username:** `demo1`
- **Email:** `familia@demo.com`
- **Password:** `demo123`
- **Familia:** Familia Demo 👨‍👩‍👧‍👦

### 👨‍👩‍👧‍👦 **Miembros Demo**
- 👨 **Papá** - 45 puntos
- 👩 **Mamá** - 38 puntos
- 👦 **Hermano** - 22 puntos
- 👧 **Hermana** - 15 puntos

### 📋 **Tareas Demo**
- 🧹 **Limpiar habitación** - 10 puntos
- 🍽️ **Lavar platos** - 8 puntos
- 🗑️ **Sacar basura** - 5 puntos
- 📚 **Hacer deberes** - 15 puntos

## 🔗 **API Endpoints Principales**

### 🔐 **Autenticación** (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/register` | Registrar nuevo usuario |
| `POST` | `/login` | Iniciar sesión |
| `POST` | `/logout` | Cerrar sesión |
| `GET` | `/me` | Usuario actual |

### 👨‍👩‍👧‍👦 **Familia** (`/api/family`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/members` | Listar miembros |
| `POST` | `/members` | Crear miembro |
| `PUT` | `/members/:id` | Actualizar miembro |
| `DELETE` | `/members/:id` | Eliminar miembro |
| `GET` | `/leaderboard` | Tabla de clasificación |

### 📋 **Tareas** (`/api/tasks`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/` | Listar tareas |
| `POST` | `/` | Crear tarea |
| `POST` | `/:id/complete` | Completar tarea |
| `GET` | `/completed` | Historial |

> 📚 **Documentación completa:** http://localhost:3000/api-docs

## 🛡️ **Seguridad Implementada**

- ✅ **JWT Authentication** - Tokens seguros con expiración
- ✅ **Bcrypt** - Hash de contraseñas con salt
- ✅ **Helmet** - Headers de seguridad HTTP
- ✅ **CORS** - Control de acceso entre dominios
- ✅ **Rate Limiting** - Protección contra abuso
- ✅ **Input Validation** - Validación Joi en todos los endpoints
- ✅ **SQL Injection Protection** - Queries parametrizadas
- ✅ **XSS Protection** - Sanitización de entrada

## 🗄️ **Base de Datos (SQLite)**

### 📊 **Esquema de Tablas**
- 👤 **users** - Usuarios y autenticación
- 👨‍👩‍👧‍👦 **family_members** - Miembros familiares
- 📋 **tasks** - Tareas del sistema
- ✅ **completed_tasks** - Historial de tareas
- 🔐 **user_sessions** - Sesiones JWT

### 🔗 **Relaciones**
- Un usuario puede tener múltiples miembros de familia
- Un miembro puede completar múltiples tareas
- Las tareas completadas mantienen el historial

## 🧪 **Testing**

### 🔧 **Backend Testing**
```bash
cd backend
npm test                   # Ejecutar tests
npm run test:coverage     # Tests con coverage
```

### 🖥️ **Frontend Testing**
```bash
cd frontend
ng test                   # Tests unitarios
ng e2e                    # Tests end-to-end
```

## 🐛 **Debugging**

### 📊 **Logs Backend**
```bash
cd backend
npm run dev              # Modo desarrollo con logs detallados
```

### 🔍 **Debug Frontend**
```bash
cd frontend
ng serve --open         # Abrir con DevTools
```

### 🛠️ **Comandos Útiles**
```bash
# Ver base de datos
sqlite3 backend/database.sqlite ".tables"

# Probar API
curl http://localhost:3000/api/health

# Verificar build Angular
cd frontend && ng build --configuration production
```

## 🚀 **Deployment**

### 🌍 **Producción**

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
ng build --configuration production
# Servir desde dist/ con nginx o similar
```

### 🐳 **Docker (Próximamente)**
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
  frontend:
    build: ./frontend
    ports:
      - "4200:80"
```

## 🤝 **Contribuir**

1. **Fork** el proyecto
2. **Crear** branch de feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. **Abrir** Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 **Soporte**

- 📧 **Email:** support@familypoints.com
- 📚 **Docs:** http://localhost:3000/api-docs
- 🐛 **Issues:** Crear issue en GitHub

---

## 🎉 **¡Aplicación Fullstack Completa y Funcional!**

### ✅ **Estado del Proyecto:**
- ✅ **Backend** - API REST completa con autenticación JWT
- ✅ **Frontend** - Aplicación Angular responsiva
- ✅ **Base de Datos** - SQLite con datos demo
- ✅ **Documentación** - Swagger UI + README completo
- ✅ **Seguridad** - Implementación robusta
- ✅ **Testing** - Setup preparado

### 🚀 **Para Empezar:**
```bash
npm run install:all && npm run dev
```

### 🔗 **Enlaces Rápidos:**
- **App:** http://localhost:4200
- **API:** http://localhost:3000/api  
- **Docs:** http://localhost:3000/api-docs

---

**¡Happy coding! 🚀**

```
src/
├── index.js                 # 🚀 Servidor principal (Express + Swagger)
├── controllers/             # 🎮 Lógica de negocio
│   ├── authController.js    #   └── Autenticación
│   ├── userController.js    #   └── Gestión de usuarios  
│   ├── familyController.js  #   └── Miembros de familia
│   └── taskController.js    #   └── Tareas y completadas
├── models/                  # 🗄️ Modelos de datos (SQLite)
│   ├── User.js             #   └── Usuarios y autenticación
│   ├── FamilyMember.js     #   └── Miembros familiares
│   ├── Task.js             #   └── Tareas del sistema
│   ├── CompletedTask.js    #   └── Historial de tareas
│   └── UserSession.js      #   └── Sesiones JWT
├── routes/                 # 🛣️ Endpoints de la API
│   ├── auth.js            #   └── /api/auth/*
│   ├── users.js           #   └── /api/users/*
│   ├── family.js          #   └── /api/family/*
│   ├── tasks.js           #   └── /api/tasks/*
│   └── index.js           #   └── Router principal
├── middleware/            # ⚙️ Middlewares
│   ├── auth.js           #   └── Autenticación JWT
│   ├── validation.js     #   └── Validación Joi
│   └── errorHandler.js   #   └── Manejo de errores
├── validators/           # ✅ Esquemas de validación
│   ├── authValidators.js
│   ├── familyValidators.js
│   └── taskValidators.js
└── database/
    └── init.js          # 🔧 Configuración SQLite
```

## 📋 Requisitos

- **Node.js** >= 18.0.0
- **npm** o **yarn**

## 🚀 Instalación y Uso

### 1. Clonar e instalar dependencias

```bash
# Clonar el repositorio
git clone <repository-url>
cd family-points-backend

# Instalar dependencias
npm install
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar variables según necesidad
vim .env
```

**Variables disponibles:**
```env
NODE_ENV=development
PORT=3000
DB_PATH=./database.sqlite
JWT_SECRET=tu_jwt_secret_super_seguro_cambiame_en_produccion
JWT_EXPIRES_IN=7d
CREATE_DEMO_DATA=true
```

### 3. Iniciar el servidor

```bash
# Modo desarrollo
npm run dev

# Modo producción  
npm start
```

### 4. Verificar funcionamiento

```bash
# Estado de la API
curl http://localhost:3000/api/health

# Información de la API
curl http://localhost:3000/api/info

# Documentación Swagger
open http://localhost:3000/api-docs
```

## 🔗 API Endpoints

### 🔐 Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/register` | Registrar nuevo usuario | - |
| `POST` | `/login` | Iniciar sesión | - |
| `POST` | `/logout` | Cerrar sesión | ✅ |
| `GET` | `/me` | Información del usuario actual | ✅ |
| `PUT` | `/change-password` | Cambiar contraseña | ✅ |
| `POST` | `/refresh` | Renovar token JWT | ✅ |

### 👤 Usuarios (`/api/users`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/profile` | Obtener perfil del usuario | ✅ |
| `PUT` | `/profile` | Actualizar perfil | ✅ |
| `DELETE` | `/profile` | Eliminar cuenta | ✅ |
| `GET` | `/stats` | Estadísticas del usuario | ✅ |

### 👨‍👩‍👧‍👦 Familia (`/api/family`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/members` | Listar miembros de familia | ✅ |
| `POST` | `/members` | Crear nuevo miembro | ✅ |
| `GET` | `/members/:id` | Obtener miembro específico | ✅ |
| `PUT` | `/members/:id` | Actualizar miembro | ✅ |
| `DELETE` | `/members/:id` | Eliminar miembro | ✅ |
| `GET` | `/leaderboard` | Tabla de clasificación | ✅ |
| `POST` | `/members/:id/points/reset` | Reiniciar puntos | ✅ |

### 📋 Tareas (`/api/tasks`)
