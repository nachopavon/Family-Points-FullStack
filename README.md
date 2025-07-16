<!--
README.md para Family Points - Aplicación Fullstack Angular + Node.js/Express + SQLite
-->
# 🏠 Family Points

**Aplicación Fullstack para gestión de tareas familiares mediante sistema de puntos y recompensas.**

---

## 📋 Índice

- [🏠 Family Points](#-family-points)
  - [📋 Índice](#-índice)
  - [🔎 Descripción](#-descripción)
  - [🚀 Tecnologías](#-tecnologías)
  - [📁 Estructura del proyecto](#-estructura-del-proyecto)
  - [⚙️ Instalación](#️-instalación)
  - [🛠️ Desarrollo](#️-desarrollo)
  - [🏗️ Build \& Deploy](#️-build--deploy)
  - [🧪 Datos de prueba](#-datos-de-prueba)
  - [🔗 API](#-api)
    - [🔐 Autenticación (`/api/auth`)](#-autenticación-apiauth)
    - [👤 Usuarios (`/api/users`)](#-usuarios-apiusers)
    - [👨‍👩‍👧‍👦 Familia (`/api/family`)](#-familia-apifamily)
    - [📋 Tareas (`/api/tasks`)](#-tareas-apitasks)
  - [🔒 Seguridad](#-seguridad)
  - [🗄️ Base de datos](#️-base-de-datos)
  - [🔍 Testing](#-testing)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [🐛 Debugging](#-debugging)
  - [🚢 Despliegue con Docker](#-despliegue-con-docker)
  - [🤝 Contribuir](#-contribuir)
  - [📄 Licencia](#-licencia)
  - [📞 Soporte](#-soporte)

---

## 🔎 Descripción

Family Points es una aplicación web que permite a las familias crear, asignar y completar tareas del hogar, acumulando puntos como recompensa. El sistema incluye autenticación de usuarios, gestión de miembros y un tablero de clasificación en tiempo real.

---

## 🚀 Tecnologías

**Frontend**

```bash
Angular 20, TypeScript, SCSS
RxJS, Angular CLI
```

**Backend**

```bash
Node.js 18+, Express 4
SQLite3 (base de datos local)
JWT, bcryptjs, helmet, cors, express-rate-limit
Joi para validación de datos
``` 

**DevOps & Docs**

- Swagger (swagger-jsdoc + swagger-ui-express)
- Docker y Docker Compose
- concurrently para comandos simultáneos

---

## 📁 Estructura del proyecto

```text
family-points/
├── backend/                # API Node.js + Express + SQLite
│   ├── src/
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── routes/         # Definición de endpoints
│   │   ├── models/         # Definiciones de datos
│   │   ├── middleware/     # Auth, validación, manejo de errores
│   │   ├── validators/     # Esquemas Joi
│   │   └── database/       # Inicialización y migraciones
│   ├── tests/              # Jest + Supertest
│   └── index.js            # Punto de entrada
├── frontend/               # Aplicación Angular
│   ├── src/app/            # Componentes, servicios y modelos
│   ├── assets/             # Recursos estáticos
│   ├── environments/       # Config variables Angular
│   └── index.html          # Página principal
├── docker-compose.yml      # Orquestación Docker
├── package.json            # Scripts raiz e instalación
database.sqlite            # Archivo SQLite (generado)
└── README.md               # Documentación del proyecto
```

---

## ⚙️ Instalación

1. Clonar el repositorio:

   ```bash
   git clone <repo-url>
   cd family-points
   ```

2. Instalar dependencias:

   ```bash
   npm install
   npm run install:backend
   npm run install:frontend
   ```

---

## 🛠️ Desarrollo

```bash
# Backend en modo desarrollo (con reinicio automático)
npm run start:backend

# Frontend en modo desarrollo
ing serve --open

# Ambos simultáneamente
npm run dev
```

---

## 🏗️ Build & Deploy

```bash
# Compilar frontend para producción
npm run build:frontend

# Compilar y desplegar backend
npm run build:all
```

---

## 🧪 Datos de prueba

- **Usuario demo**: `demo@familypoints.com` / `demo123`
- **Miembros demo**:
  - Papá (45 puntos)
  - Mamá (38)
  - Hermano (22)
  - Hermana (15)
- **Tareas demo**:
  - Limpiar habitación (10 puntos)
  - Lavar platos (8)
  - Sacar basura (5)
  - Hacer deberes (15)

---

## 🔗 API

### 🔐 Autenticación (`/api/auth`)

| Método | Ruta        | Descripción             |
| ------ | ----------- | ----------------------- |
| POST   | `/register` | Registrar nuevo usuario |
| POST   | `/login`    | Iniciar sesión          |
| POST   | `/logout`   | Cerrar sesión           |
| GET    | `/me`       | Obtener usuario actual  |

### 👤 Usuarios (`/api/users`)

| Método | Ruta       | Descripción           | Auth |
| ------ | ---------- | --------------------- | ---- |
| GET    | `/profile` | Obtener perfil        | ✅   |
| PUT    | `/profile` | Actualizar perfil     | ✅   |
| DELETE | `/profile` | Eliminar cuenta       | ✅   |
| GET    | `/stats`   | Estadísticas usuario  | ✅   |

### 👨‍👩‍👧‍👦 Familia (`/api/family`)

| Método | Ruta               | Descripción         | Auth |
| ------ | ------------------ | ------------------- | ---- |
| GET    | `/members`         | Listar miembros     | ✅   |
| POST   | `/members`         | Crear miembro       | ✅   |
| PUT    | `/members/:id`     | Actualizar miembro  | ✅   |
| DELETE | `/members/:id`     | Eliminar miembro    | ✅   |
| GET    | `/leaderboard`     | Tabla de clasificación | ✅ |

### 📋 Tareas (`/api/tasks`)

| Método | Ruta               | Descripción            | Auth |
| ------ | ------------------ | ---------------------- | ---- |
| GET    | `/`                | Listar tareas          | ✅   |
| POST   | `/`                | Crear tarea            | ✅   |
| POST   | `/:id/complete`    | Completar tarea        | ✅   |
| GET    | `/completed`       | Historial completadas  | ✅   |

---

## 🔒 Seguridad

- Autenticación con JWT y expiración configurable
- Hash de contraseñas con bcryptjs
- Cabeceras seguras con Helmet
- CORS y rate limiting para evitar abuso
- Validación de entradas con Joi

---

## 🗄️ Base de datos

El proyecto usa SQLite local (`database.sqlite`) con migraciones automáticas.

**Tablas principales**:

- `users`
- `family_members`
- `tasks`
- `completed_tasks`
- `user_sessions`

---

## 🔍 Testing

### Backend

```bash
cd backend
npm test           # Ejecutar tests con Jest
npm run coverage   # Ver cobertura
```

### Frontend

```bash
cd frontend
ng test            # Tests unitarios
ng e2e             # Tests end-to-end
```

---

## 🐛 Debugging

```bash
npm run start:backend          # Backend con logs detallados
npm run start:frontend -- --open # Frontend con DevTools abierto
```

---

## 🚢 Despliegue con Docker

```bash
docker-compose up --build
```

---

## 🤝 Contribuir

1. Haz fork del repositorio
2. Crea una rama de feature: `git checkout -b feature/mi-feature`
3. Realiza cambios y commitea: `git commit -m "feat: descripción"`
4. Envía tu rama: `git push origin feature/mi-feature`
5. Abre Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta [LICENSE](LICENSE) para más detalles.

---

## 📞 Soporte

- Email: support@familypoints.com
- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)