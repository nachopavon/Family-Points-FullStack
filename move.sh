#!/bin/bash
cd /Users/nachopavon/workspace/test-copilot-backend

echo "📦 Moviendo frontend al workspace..."
cp -r /Users/nachopavon/workspace/test-copilot ./frontend

echo "🔧 Reorganizando backend..."
mkdir -p backend
mv src backend/
mv package.json backend/
mv package-lock.json backend/ 2>/dev/null || true
mv database.sqlite backend/
mv debug.js backend/
mv node_modules backend/ 2>/dev/null || true

echo "📝 Creando scripts de desarrollo..."
cat > package.json << 'EOF'
{
  "name": "family-points-fullstack",
  "version": "1.0.0",
  "description": "Family Points - Fullstack Application",
  "scripts": {
    "install:backend": "cd backend && npm install",
    "install:frontend": "cd frontend && npm install", 
    "install:all": "npm run install:backend && npm run install:frontend",
    "start:backend": "cd backend && npm start",
    "start:frontend": "cd frontend && ng serve",
    "dev": "concurrently \"npm run start:backend\" \"npm run start:frontend\"",
    "build:frontend": "cd frontend && ng build",
    "test:backend": "cd backend && npm test",
    "test:frontend": "cd frontend && ng test"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
EOF

echo "✅ ¡Listo! Estructura reorganizada."
echo "📁 Ejecuta: ls -la para ver la nueva estructura"
