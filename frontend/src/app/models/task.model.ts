export interface Task {
  id: string;
  name: string;
  description?: string;
  points: number;
  category: string;
  icon?: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
}

export interface CreateTaskRequest {
  name: string;
  description?: string;
  points: number;
  category: string;
  icon?: string;
}

export interface UpdateTaskRequest {
  name?: string;
  description?: string;
  points?: number;
  category?: string;
  icon?: string;
}

export interface CompleteTaskRequest {
  memberId: string;
  notes?: string;
}

export interface CompletedTask {
  id: string;
  task_id: string;
  member_id: string;
  user_id: string;
  completed_at: string;
  points: number;
  notes?: string;
  // Datos expandidos del join
  task_name?: string;
  member_name?: string;
  task_icon?: string;
}

// Enum para categorías (para compatibilidad con componentes existentes)
export enum TaskCategory {
  COOKING = 'cocina',
  CLEANING = 'limpieza',
  GARDEN = 'jardin',
  PETS = 'mascotas',
  STUDY = 'estudio',
  SPORT = 'deporte',
  HELP = 'ayuda',
  OTHER = 'otro'
}

// Categorías disponibles (sincronizadas con el backend)
export const TASK_CATEGORIES = [
  'cocina',
  'limpieza',
  'jardin',
  'mascotas',
  'estudio',
  'deporte',
  'ayuda',
  'otro'
] as const;
