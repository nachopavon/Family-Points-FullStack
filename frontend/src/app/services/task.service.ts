import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, map, Subject, of } from 'rxjs';
import { Task, CompletedTask, CreateTaskRequest, CompleteTaskRequest } from '../models/task.model';
import { FamilyService } from './family.service';
import { NotificationService } from './notification.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  private completedTasksSubject = new BehaviorSubject<CompletedTask[]>([]);
  private memberStatsChangedSubject = new Subject<void>();
  private currentUserId: string | null = null;

  constructor(
    private apiService: ApiService,
    private familyService: FamilyService,
    private notificationService: NotificationService
  ) {
    // No cargar tareas automáticamente hasta que se establezca el usuario
  }

  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    this.loadTasks();
    this.loadCompletedTasks();
  }

  clearCurrentUser(): void {
    this.currentUserId = null;
    this.tasksSubject.next([]);
    this.completedTasksSubject.next([]);
  }

  // Observable para notificar cambios en las estadísticas de miembros
  get memberStatsChanged$(): Observable<void> {
    return this.memberStatsChangedSubject.asObservable();
  }

  private loadTasks(): void {
    if (!this.currentUserId) return;

    this.apiService.get<Task[]>('/tasks')
      .subscribe({
        next: (tasks) => this.tasksSubject.next(tasks),
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.notificationService.showError('Error al cargar las tareas');
        }
      });
  }

  private loadCompletedTasks(): void {
    if (!this.currentUserId) return;

    this.apiService.get<CompletedTask[]>('/tasks/completed')
      .subscribe({
        next: (completedTasks) => this.completedTasksSubject.next(completedTasks),
        error: (error) => {
          console.error('Error loading completed tasks:', error);
          this.notificationService.showError('Error al cargar las tareas completadas');
        }
      });
  }

  getTasks(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  getCompletedTasks(): Observable<CompletedTask[]> {
    return this.completedTasksSubject.asObservable();
  }

  createTask(taskData: CreateTaskRequest): Observable<Task> {
    return this.apiService.post<Task>('/tasks', taskData)
      .pipe(
        tap(newTask => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = [...currentTasks, newTask];
          this.tasksSubject.next(updatedTasks);
          this.notificationService.showSuccess(`¡Tarea "${newTask.name}" creada exitosamente! ✨`);
        }),
        catchError(error => {
          const message = error?.message || 'Error al crear la tarea';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  updateTask(taskId: string, updates: Partial<Task>): Observable<Task> {
    return this.apiService.put<Task>(`/tasks/${taskId}`, updates)
      .pipe(
        tap(updatedTask => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.map(task =>
            task.id === taskId ? updatedTask : task
          );
          this.tasksSubject.next(updatedTasks);
          this.notificationService.showSuccess(`¡Tarea "${updatedTask.name}" actualizada! ✨`);
        }),
        catchError(error => {
          const message = error?.message || 'Error al actualizar la tarea';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  deleteTask(taskId: string): Observable<boolean> {
    return this.apiService.delete<{message: string}>(`/tasks/${taskId}`)
      .pipe(
        tap(() => {
          const currentTasks = this.tasksSubject.value;
          const updatedTasks = currentTasks.filter(task => task.id !== taskId);
          this.tasksSubject.next(updatedTasks);
          this.notificationService.showSuccess('Tarea eliminada exitosamente 🗑️');
        }),
        map(() => true),
        catchError(error => {
          const message = error?.message || 'Error al eliminar la tarea';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  completeTask(taskId: string, completeData: CompleteTaskRequest): Observable<CompletedTask> {
    return this.apiService.post<CompletedTask>(`/tasks/${taskId}/complete`, completeData)
      .pipe(
        tap(completedTask => {
          // Actualizar lista de tareas completadas
          const currentCompleted = this.completedTasksSubject.value;
          const updatedCompleted = [...currentCompleted, completedTask];
          this.completedTasksSubject.next(updatedCompleted);

          // Recargar miembros para obtener puntos actualizados
          // (El backend ya actualiza los puntos automáticamente)
          this.familyService.refreshMembers();

          // Notificar que las estadísticas de miembros han cambiado
          this.memberStatsChangedSubject.next();

          this.notificationService.showSuccess(
            `¡Tarea completada! +${completedTask.points} puntos para ${completedTask.member_name || 'el miembro'} 🎉`
          );
        }),
        catchError(error => {
          const message = error?.message || 'Error al completar la tarea';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  // Métodos de utilidad para estadísticas
  getTotalPointsForMember(memberId: string): Observable<number> {
    return this.getCompletedTasksByMember(memberId)
      .pipe(
        map(completedTasks =>
          completedTasks.reduce((total, task) => total + task.points, 0)
        )
      );
  }

  getCompletedTasksByMember(memberId: string): Observable<CompletedTask[]> {
    return this.apiService.get<CompletedTask[]>(`/tasks/completed/member/${memberId}`)
      .pipe(
        catchError(error => {
          console.error('Error getting completed tasks by member:', error);
          throw error;
        })
      );
  }

  getWeeklyStatsForMember(memberId: string): Observable<{points: number, tasksCompleted: number}> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.getCompletedTasksInDateRange(startOfWeek, endOfWeek)
      .pipe(
        map(completedTasks => {
          const memberTasks = completedTasks.filter(task => task.member_id === memberId);
          return {
            points: memberTasks.reduce((total, task) => total + task.points, 0),
            tasksCompleted: memberTasks.length
          };
        })
      );
  }

  getCompletedTasksInDateRange(startDate: Date, endDate: Date): Observable<CompletedTask[]> {
    const params = `?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;

    return this.apiService.get<CompletedTask[]>(`/tasks/completed/range${params}`)
      .pipe(
        catchError(error => {
          console.error('❌ TaskService: Error en /tasks/completed/range:', error);
          // En caso de error, devolver array vacío en lugar de propagar el error
          return of([]);
        })
      );
  }

  getCompletedTasksToday(): Observable<CompletedTask[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    return this.getCompletedTasksInDateRange(startOfDay, endOfDay);
  }

  getTaskById(taskId: string): Observable<Task> {
    return this.apiService.get<Task>(`/tasks/${taskId}`)
      .pipe(
        catchError(error => {
          console.error('Error getting task:', error);
          throw error;
        })
      );
  }
}
