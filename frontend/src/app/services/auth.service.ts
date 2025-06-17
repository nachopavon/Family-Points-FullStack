import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { FamilyService } from './family.service';
import { TaskService } from './task.service';
import { NotificationService } from './notification.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private readonly TOKEN_KEY = 'family-points-token';
  private readonly USER_KEY = 'family-points-user';

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private familyService: FamilyService,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userData = localStorage.getItem(this.USER_KEY);

    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        this.apiService.setAuthToken(token);
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        this.setupUserServices(user.id);
      } catch (error) {
        console.error('Error loading user session:', error);
        this.logout();
      }
    }
  }

  private setupUserServices(userId: string): void {
    this.familyService.setCurrentUser(userId);
    this.taskService.setCurrentUser(userId);
  }

  register(registerData: RegisterRequest): Observable<User> {
    return this.apiService.post<{user: User, token: string}>('/auth/register', registerData)
      .pipe(
        tap(response => {
          this.setAuthData(response.user, response.token);
          this.notificationService.showSuccess(`¡Cuenta creada exitosamente para ${registerData.familyName}! 🎊`);
        }),
        map(response => response.user),
        catchError(error => {
          const message = error?.message || 'Error al crear la cuenta';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.apiService.post<{user: User, token: string}>('/auth/login', credentials)
      .pipe(
        tap(response => {
          this.setAuthData(response.user, response.token);
          this.notificationService.showSuccess(`¡Bienvenido/a de vuelta, ${response.user.username}! 🎉`);
        }),
        map(response => response.user),
        catchError(error => {
          const message = error?.message || 'Error al iniciar sesión';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  private setAuthData(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.apiService.setAuthToken(token);
    this.currentUserSubject.next(user);
    this.isLoggedInSubject.next(true);
    this.setupUserServices(user.id);
  }

  logout(): void {
    const currentUser = this.getCurrentUser();

    // Intentar logout en el servidor
    this.apiService.post('/auth/logout', {}).subscribe({
      next: () => console.log('Logout successful on server'),
      error: (error) => console.warn('Logout error on server:', error)
    });

    // Limpiar datos locales
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.apiService.clearAuthToken();
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);

    // Limpiar servicios
    this.familyService.clearCurrentUser();
    this.taskService.clearCurrentUser();

    // Mostrar notificación de logout
    if (currentUser) {
      this.notificationService.showInfo(`¡Hasta luego, ${currentUser.username}! 👋`);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.apiService.put<User>('/users/profile', userData)
      .pipe(
        tap(updatedUser => {
          localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
          this.notificationService.showSuccess('Perfil actualizado exitosamente');
        }),
        catchError(error => {
          const message = error?.message || 'Error al actualizar el perfil';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  deleteAccount(): Observable<boolean> {
    return this.apiService.delete<{message: string}>('/users/profile')
      .pipe(
        tap(() => {
          this.logout();
          this.notificationService.showSuccess('Cuenta eliminada exitosamente');
        }),
        map(() => true),
        catchError(error => {
          const message = error?.message || 'Error al eliminar la cuenta';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  // Método para verificar si el token es válido
  verifyToken(): Observable<boolean> {
    return this.apiService.get<{valid: boolean}>('/auth/verify')
      .pipe(
        map(response => response.valid),
        tap(valid => {
          if (!valid) {
            this.logout();
          }
        }),
        catchError(() => {
          this.logout();
          return of(false);
        })
      );
  }
}
