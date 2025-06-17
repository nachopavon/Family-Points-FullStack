export interface User {
  id: string;
  username: string;
  email: string;
  family_name: string;  // Cambiado para coincidir con el backend
  avatar?: string;
  created_at: string;   // Cambiado para coincidir con el backend
  last_login?: string;  // Cambiado para coincidir con el backend
}

export interface LoginRequest {
  username: string;
  password: string;
}

// Alias para mantener compatibilidad con componentes existentes
export interface LoginCredentials extends LoginRequest {}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  familyName: string;  // El backend espera familyName en camelCase
  avatar?: string;
}

// Alias para mantener compatibilidad con componentes existentes
export interface RegisterData extends RegisterRequest {}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Interfaz para sesión (mantener compatibilidad)
export interface UserSession {
  user: User;
  token: string;
  expiresAt: Date;
}
