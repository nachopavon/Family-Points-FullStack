const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

let db = null;

// Inicializar conexión a la base de datos
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || './database.sqlite';
    const dbDir = path.dirname(dbPath);
    
    // Crear directorio si no existe
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error conectando a SQLite:', err.message);
        reject(err);
      } else {
        console.log('✅ Conectado a la base de datos SQLite');
        createTables()
          .then(() => {
            if (process.env.CREATE_DEMO_DATA === 'true') {
              return createDemoData();
            }
          })
          .then(() => resolve())
          .catch(reject);
      }
    });
  });
}

// Crear tablas
function createTables() {
  return new Promise((resolve, reject) => {
    const createTableQueries = [
      // Tabla de usuarios
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        family_name TEXT NOT NULL,
        avatar TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )`,
      
      // Tabla de miembros de familia
      `CREATE TABLE IF NOT EXISTS family_members (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        avatar TEXT,
        total_points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabla de tareas
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        points INTEGER NOT NULL,
        category TEXT NOT NULL,
        icon TEXT,
        is_default BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabla de tareas completadas
      `CREATE TABLE IF NOT EXISTS completed_tasks (
        id TEXT PRIMARY KEY,
        task_id TEXT NOT NULL,
        member_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        points INTEGER NOT NULL,
        notes TEXT,
        FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (member_id) REFERENCES family_members (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`,
      
      // Tabla de sesiones
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )`
    ];

    let completed = 0;
    const total = createTableQueries.length;

    createTableQueries.forEach((query, index) => {
      db.run(query, (err) => {
        if (err) {
          console.error(`❌ Error creando tabla ${index + 1}:`, err.message);
          reject(err);
        } else {
          completed++;
          if (completed === total) {
            console.log('✅ Todas las tablas creadas correctamente');
            resolve();
          }
        }
      });
    });
  });
}

// Crear datos de demostración
function createDemoData() {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');

    // Verificar si ya existe el usuario demo
    db.get('SELECT id FROM users WHERE username = ?', ['demo1'], async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row) {
        console.log('✅ Datos demo ya existen');
        resolve();
        return;
      }

      try {
        const demoUserId = 'demo1';
        const hashedPassword = await bcrypt.hash('demo123', 10);

        // Crear usuario demo
        db.run(
          'INSERT INTO users (id, username, email, password_hash, family_name, avatar) VALUES (?, ?, ?, ?, ?, ?)',
          [demoUserId, 'demo1', 'familia@demo.com', hashedPassword, 'Familia Demo', '👨‍👩‍👧‍👦'],
          function(err) {
            if (err) {
              reject(err);
              return;
            }

            // Crear miembros demo
            const demoMembers = [
              { id: 'papa', name: 'Papá', avatar: '👨' },
              { id: 'mama', name: 'Mamá', avatar: '👩' },
              { id: 'hermano', name: 'Hermano', avatar: '👦' },
              { id: 'hermana', name: 'Hermana', avatar: '👧' }
            ];

            let membersCompleted = 0;
            demoMembers.forEach(member => {
              db.run(
                'INSERT INTO family_members (id, user_id, name, avatar, total_points) VALUES (?, ?, ?, ?, ?)',
                [member.id, demoUserId, member.name, member.avatar, 0],
                (err) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  membersCompleted++;
                  if (membersCompleted === demoMembers.length) {
                    // Crear tareas demo
                    const demoTasks = [
                      { id: 'task1', name: 'Lavar los platos', description: 'Lavar y secar todos los platos después de la comida', points: 10, category: 'cocina', icon: '🍽️', is_default: true },
                      { id: 'task2', name: 'Sacar la basura', description: 'Sacar la basura y poner una bolsa nueva', points: 5, category: 'limpieza', icon: '🗑️', is_default: true },
                      { id: 'task3', name: 'Hacer la cama', description: 'Hacer la cama y organizar la habitación', points: 5, category: 'limpieza', icon: '🛏️', is_default: true },
                      { id: 'task4', name: 'Aspirar la sala', description: 'Aspirar la sala y organizar los cojines', points: 15, category: 'limpieza', icon: '🧹', is_default: true },
                      { id: 'task5', name: 'Estudiar matemáticas', description: 'Completar los ejercicios de matemáticas', points: 20, category: 'estudio', icon: '📚', is_default: true },
                      { id: 'task6', name: 'Leer un libro', description: 'Leer al menos 30 minutos', points: 15, category: 'estudio', icon: '📖', is_default: true },
                      { id: 'task7', name: 'Ejercicio físico', description: 'Hacer ejercicio por 30 minutos', points: 25, category: 'deporte', icon: '🏃‍♂️', is_default: true },
                      { id: 'task8', name: 'Ayudar en la cocina', description: 'Ayudar a preparar la comida', points: 10, category: 'ayuda', icon: '👨‍🍳', is_default: true },
                      { id: 'task9', name: 'Regar las plantas', description: 'Regar todas las plantas del jardín', points: 8, category: 'jardin', icon: '🌱', is_default: true },
                      { id: 'task10', name: 'Alimentar a la mascota', description: 'Dar comida y agua a las mascotas', points: 7, category: 'mascotas', icon: '🐕', is_default: true }
                    ];

                    let tasksCompleted = 0;
                    demoTasks.forEach(task => {
                      db.run(
                        'INSERT INTO tasks (id, user_id, name, description, points, category, icon, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [task.id, demoUserId, task.name, task.description, task.points, task.category, task.icon, task.is_default],
                        (err) => {
                          if (err) {
                            reject(err);
                            return;
                          }
                          tasksCompleted++;
                          if (tasksCompleted === demoTasks.length) {
                            console.log('✅ Datos demo creados correctamente');
                            resolve();
                          }
                        }
                      );
                    });
                  }
                }
              );
            });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Obtener instancia de la base de datos
function getDatabase() {
  if (!db) {
    throw new Error('Base de datos no inicializada');
  }
  return db;
}

// Cerrar conexión
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Conexión a la base de datos cerrada');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};
