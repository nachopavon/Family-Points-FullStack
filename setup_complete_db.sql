-- Crear todas las tablas
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  family_name TEXT NOT NULL,
  avatar TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

CREATE TABLE IF NOT EXISTS family_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  total_points INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
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
);

CREATE TABLE IF NOT EXISTS completed_tasks (
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
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Insertar datos demo
INSERT INTO users (id, username, email, password_hash, family_name, avatar, created_at, last_login) 
VALUES (
  'demo1', 
  'demo1', 
  'familia@demo.com', 
  '$2a$10$eZ0pSWMm8p4v4PiCh270i.c3lJz00wNfuIZij.95zGvLtzi6OeAM2', -- hash de 'demo123'
  'Familia Demo', 
  '👨‍👩‍👧‍👦',
  datetime('now'),
  NULL
);

INSERT INTO family_members (id, user_id, name, avatar, total_points, created_at) VALUES
('papa', 'demo1', 'Papá', '👨', 0, datetime('now')),
('mama', 'demo1', 'Mamá', '👩', 0, datetime('now')),
('hermano', 'demo1', 'Hermano', '👦', 0, datetime('now')),
('hermana', 'demo1', 'Hermana', '👧', 0, datetime('now'));

INSERT INTO tasks (id, user_id, name, description, points, category, icon, is_default, created_at) VALUES
('task1', 'demo1', 'Lavar los platos', 'Lavar y secar todos los platos después de la comida', 10, 'limpieza', '🍽️', 1, datetime('now')),
('task2', 'demo1', 'Sacar la basura', 'Sacar la basura y poner una bolsa nueva', 5, 'limpieza', '🗑️', 1, datetime('now')),
('task3', 'demo1', 'Hacer la cama', 'Hacer la cama y organizar la habitación', 5, 'limpieza', '🛏️', 1, datetime('now')),
('task4', 'demo1', 'Aspirar la sala', 'Aspirar la sala y organizar los cojines', 15, 'limpieza', '🧹', 1, datetime('now')),
('task5', 'demo1', 'Estudiar matemáticas', 'Completar los ejercicios de matemáticas', 20, 'educacion', '📚', 1, datetime('now')),
('task6', 'demo1', 'Leer un libro', 'Leer al menos 30 minutos', 15, 'educacion', '📖', 1, datetime('now')),
('task7', 'demo1', 'Ejercicio físico', 'Hacer ejercicio por 30 minutos', 25, 'salud', '🏃‍♂️', 1, datetime('now')),
('task8', 'demo1', 'Ayudar en la cocina', 'Ayudar a preparar la comida', 10, 'hogar', '👨‍🍳', 1, datetime('now'));
