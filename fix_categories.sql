-- Eliminar tareas con categorías inválidas
DELETE FROM tasks WHERE category NOT IN ('cocina', 'limpieza', 'jardin', 'mascotas', 'estudio', 'deporte', 'ayuda', 'otro');

-- Actualizar tareas existentes con categorías corregidas
UPDATE tasks SET category = 'estudio' WHERE category = 'educacion';
UPDATE tasks SET category = 'deporte' WHERE category = 'salud';
UPDATE tasks SET category = 'ayuda' WHERE category = 'hogar';

-- Verificar que todas las categorías son válidas
SELECT DISTINCT category FROM tasks;
