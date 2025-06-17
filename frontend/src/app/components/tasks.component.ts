import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';

import { Task } from '../models/task.model';
import { FamilyMember } from '../models/family-member.model';
import { TaskService } from '../services/task.service';
import { FamilyService } from '../services/family.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  members$!: Observable<FamilyMember[]>;
  showAddTaskForm = false;
  editingTask: Task | null = null;
  isCreatingTask = false;

  newTask: Partial<Task> = {
    name: '',
    description: '',
    points: 10,
    category: '',
    icon: '📝'
  };

  categories = [
    { key: 'casa', value: 'Casa' },
    { key: 'escuela', value: 'Escuela' },
    { key: 'personal', value: 'Personal' },
    { key: 'general', value: 'General' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private taskService: TaskService,
    private familyService: FamilyService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.members$ = this.familyService.getMembers();
    this.loadTasks();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadTasks() {
    const sub = this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.notificationService.showError('Error al cargar las tareas');
      }
    });
    this.subscriptions.push(sub);
  }

  addTask() {
    if (!this.isValidTask()) {
      return;
    }

    this.isCreatingTask = true;

    const sub = this.taskService.createTask(this.newTask as Task).subscribe({
      next: (task) => {
        this.tasks.push(task);
        this.resetForm();
        this.notificationService.showSuccess('✅ Tarea creada exitosamente');
        this.isCreatingTask = false;
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.notificationService.showError('❌ Error al crear la tarea');
        this.isCreatingTask = false;
      }
    });
    this.subscriptions.push(sub);
  }

  editTask(task: Task) {
    this.editingTask = task;
    this.newTask = { ...task };
    this.showAddTaskForm = true;
  }

  updateTask() {
    if (!this.isValidTask() || !this.editingTask) {
      return;
    }

    this.isCreatingTask = true;

    const sub = this.taskService.updateTask(this.editingTask.id, this.newTask as Task).subscribe({
      next: (updatedTask) => {
        const index = this.tasks.findIndex(t => t.id === this.editingTask!.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.resetForm();
        this.notificationService.showSuccess('✅ Tarea actualizada exitosamente');
        this.isCreatingTask = false;
      },
      error: (error) => {
        console.error('Error updating task:', error);
        this.notificationService.showError('❌ Error al actualizar la tarea');
        this.isCreatingTask = false;
      }
    });
    this.subscriptions.push(sub);
  }

  deleteTask(taskId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    const sub = this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.notificationService.showSuccess('✅ Tarea eliminada exitosamente');
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.notificationService.showError('❌ Error al eliminar la tarea');
      }
    });
    this.subscriptions.push(sub);
  }

  cancelAddTask() {
    this.resetForm();
  }

  private resetForm() {
    this.showAddTaskForm = false;
    this.editingTask = null;
    this.newTask = {
      name: '',
      description: '',
      points: 10,
      category: '',
      icon: '📝'
    };
  }

  isValidTask(): boolean {
    return !!(this.newTask.name &&
              this.newTask.category &&
              this.newTask.points &&
              this.newTask.points > 0);
  }

  getEmojiSuggestions(): string[] {
    const categoryEmojis: { [key: string]: string[] } = {
      'casa': ['🧹', '🍽️', '🧽', '🛏️', '🧺', '🚿'],
      'escuela': ['📚', '✏️', '📝', '🎒', '📖', '✅'],
      'personal': ['🏃', '🧘', '🎵', '🎨', '💪', '🌱'],
      'general': ['⭐', '💡', '🎯', '✨', '🔥', '💫']
    };

    return categoryEmojis[this.newTask.category || 'general'] || categoryEmojis['general'];
  }

  selectEmoji(emoji: string) {
    this.newTask.icon = emoji;
  }

  getCategoryName(categoryKey: string): string {
    const category = this.categories.find(c => c.key === categoryKey);
    return category ? category.value : categoryKey;
  }

  // Track by functions para optimizar rendering
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  trackByCategory(index: number, category: any): string {
    return category.key;
  }
}
