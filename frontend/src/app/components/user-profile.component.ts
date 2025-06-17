import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';
import { FamilyService } from '../services/family.service';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../services/notification.service';

// Importar la librería xlsx para exportar a Excel
declare var XLSX: any;

interface FamilyStats {
  totalPoints: number;
  totalTasks: number;
  activeMembersCount: number;
  avgTasksPerDay: number;
  maxPoints: number;
  maxDailyTasks: number;
  memberRanking: Array<{
    id: string;
    name: string;
    avatar: string;
    points: number;
    tasksCount: number;
  }>;
  weeklyActivity: Array<{
    date: string;
    tasks: number;
    points: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
    points: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    earned: boolean;
    progress: number;
    target: number;
  }>;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <div class="user-avatar">
          {{ currentUser?.avatar || getInitials(currentUser?.username) }}
        </div>
        <div class="user-info">
          <h1>{{ currentUser?.username }}</h1>
          <p class="user-email">{{ currentUser?.email }}</p>
          <div class="user-stats">
            <span class="stat">👥 {{ totalMembers$ | async }} miembros</span>
            <span class="stat">📋 {{ totalTasks$ | async }} tareas disponibles</span>
          </div>
        </div>
        <button class="btn-edit" (click)="toggleEdit()">
          {{ isEditing ? '❌ Cancelar' : '✏️ Editar Perfil' }}
        </button>
      </div>

      <div class="profile-content">
        <!-- Edición de perfil -->
        <div class="profile-section" *ngIf="isEditing">
          <h3>✏️ Editar Perfil</h3>
          <form (ngSubmit)="saveProfile()" #profileForm="ngForm">
            <div class="form-group">
              <label>👤 Nombre de usuario:</label>
              <input
                type="text"
                [(ngModel)]="editData.username"
                name="username"
                required
                minlength="2"
                maxlength="50"
                #usernameField="ngModel">
              <div class="error-message" *ngIf="usernameField.invalid && usernameField.touched">
                El nombre de usuario debe tener entre 2 y 50 caracteres
              </div>
            </div>

            <div class="form-group">
              <label>📧 Email:</label>
              <input
                type="email"
                [(ngModel)]="editData.email"
                name="email"
                required
                email
                #emailField="ngModel">
              <div class="error-message" *ngIf="emailField.invalid && emailField.touched">
                Ingrese un email válido
              </div>
            </div>

            <div class="form-group">
              <label>🎭 Avatar:</label>
              <div class="avatar-selector">
                <button
                  type="button"
                  *ngFor="let avatar of avatarOptions; trackBy: trackByAvatar"
                  class="avatar-option"
                  [class.selected]="editData.avatar === avatar"
                  (click)="selectAvatar(avatar)">
                  {{avatar}}
                </button>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save" [disabled]="isSaving">
                <span *ngIf="isSaving">🔄 Guardando...</span>
                <span *ngIf="!isSaving">💾 Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Gestión de datos -->
        <div class="profile-section">
          <h3>📊 Gestión de Datos</h3>
          <div class="data-actions">
            <button class="btn-export" (click)="exportData()">
              📁 Exportar a Excel
            </button>
            <button class="btn-import" (click)="importData()">
              📥 Importar Datos
            </button>
            <button class="btn-clear" (click)="clearAllData()">
              🗑️ Limpiar Todos los Datos
            </button>
          </div>
        </div>

        <!-- Estadísticas Familiares -->
        <div class="profile-section stats-section">
          <div class="section-header">
            <h3>📈 Estadísticas Familiares</h3>
            <div class="stats-controls">
              <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadFamilyStats()" class="period-selector">
                <option value="week">Esta Semana</option>
                <option value="month">Este Mes</option>
                <option value="3months">Últimos 3 Meses</option>
                <option value="year">Este Año</option>
              </select>
              <button class="btn-refresh" (click)="refreshStats()" [disabled]="loadingStats">
                <span *ngIf="!loadingStats">🔄</span>
                <span *ngIf="loadingStats" class="spinner"></span>
              </button>
            </div>
          </div>

          <div class="stats-loading" *ngIf="loadingStats">
            <div class="loading-spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>

          <div class="stats-content" *ngIf="!loadingStats && familyStats">
            <!-- Resumen general -->
            <div class="stats-summary">
              <div class="summary-card">
                <div class="summary-icon">🏆</div>
                <div class="summary-info">
                  <span class="summary-number">{{ familyStats.totalPoints }}</span>
                  <span class="summary-label">Puntos Totales</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">✅</div>
                <div class="summary-info">
                  <span class="summary-number">{{ familyStats.totalTasks }}</span>
                  <span class="summary-label">Tareas Completadas</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">👥</div>
                <div class="summary-info">
                  <span class="summary-number">{{ familyStats.activeMembersCount }}</span>
                  <span class="summary-label">Miembros Activos</span>
                </div>
              </div>
              <div class="summary-card">
                <div class="summary-icon">📅</div>
                <div class="summary-info">
                  <span class="summary-number">{{ familyStats.avgTasksPerDay | number:'1.1-1' }}</span>
                  <span class="summary-label">Tareas/Día</span>
                </div>
              </div>
            </div>

            <!-- Gráfico de progreso por miembro -->
            <div class="chart-container">
              <h4>🏅 Ranking de Miembros ({{ getPeriodLabel() }})</h4>
              <div class="member-ranking">
                <div
                  *ngFor="let member of familyStats.memberRanking; let i = index; trackBy: trackByMemberId"
                  class="ranking-item"
                  [class.top-performer]="i === 0">
                  <div class="ranking-position">
                    <span class="position-number">{{ i + 1 }}</span>
                    <span class="position-medal" *ngIf="i < 3">{{ getMedal(i) }}</span>
                  </div>
                  <div class="member-info">
                    <div class="member-avatar">{{ member.avatar || getInitials(member.name) }}</div>
                    <span class="member-name">{{ member.name }}</span>
                  </div>
                  <div class="member-stats">
                    <div class="progress-bar">
                      <div
                        class="progress-fill"
                        [style.width.%]="getMemberProgressPercentage(member.points, familyStats.maxPoints)">
                      </div>
                    </div>
                    <div class="stats-numbers">
                      <span class="points">{{ member.points }} pts</span>
                      <span class="tasks">{{ member.tasksCount }} tareas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Gráfico de actividad semanal -->
            <div class="chart-container" *ngIf="familyStats.weeklyActivity && familyStats.weeklyActivity.length > 0">
              <h4>📊 Actividad Semanal</h4>
              <div class="weekly-chart">
                <div
                  *ngFor="let day of familyStats.weeklyActivity; trackBy: trackByDate"
                  class="day-bar">
                  <div
                    class="bar"
                    [style.height.%]="getDayActivityPercentage(day.tasks, familyStats.maxDailyTasks)"
                    [title]="day.date + ': ' + day.tasks + ' tareas'">
                  </div>
                  <span class="day-label">{{ getDayLabel(day.date) }}</span>
                  <span class="day-count">{{ day.tasks }}</span>
                </div>
              </div>
            </div>

            <!-- Distribución por categorías -->
            <div class="chart-container" *ngIf="familyStats.categoryDistribution && familyStats.categoryDistribution.length > 0">
              <h4>🎯 Tareas por Categoría</h4>
              <div class="category-chart">
                <div
                  *ngFor="let category of familyStats.categoryDistribution; trackBy: trackByCategory"
                  class="category-item">
                  <div class="category-info">
                    <span class="category-icon">{{ getCategoryIcon(category.category) }}</span>
                    <span class="category-name">{{ category.category }}</span>
                  </div>
                  <div class="category-progress">
                    <div class="category-bar">
                      <div
                        class="category-fill"
                        [style.width.%]="getCategoryPercentage(category.count, familyStats.totalTasks)">
                      </div>
                    </div>
                    <div class="category-stats">
                      <span class="category-count">{{ category.count }}</span>
                      <span class="category-percentage">({{ getCategoryPercentage(category.count, familyStats.totalTasks) | number:'1.0-0' }}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Logros y badges -->
            <div class="achievements-container" *ngIf="familyStats.achievements && familyStats.achievements.length > 0">
              <h4>🏆 Logros Familiares</h4>
              <div class="achievements-grid">
                <div
                  *ngFor="let achievement of familyStats.achievements; trackBy: trackByAchievement"
                  class="achievement-badge"
                  [class.earned]="achievement.earned"
                  [title]="achievement.description">
                  <div class="badge-icon">{{ achievement.icon }}</div>
                  <div class="badge-info">
                    <span class="badge-name">{{ achievement.name }}</span>
                    <span class="badge-progress" *ngIf="!achievement.earned">
                      {{ achievement.progress }}/{{ achievement.target }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="stats-empty" *ngIf="!loadingStats && !familyStats">
            <div class="empty-icon">📊</div>
            <h4>No hay estadísticas disponibles</h4>
            <p>Completa algunas tareas para ver las estadísticas familiares.</p>
          </div>
        </div>

        <!-- Zona de peligro -->
        <div class="profile-section danger-zone">
          <h3>⚠️ Zona de Peligro</h3>
          <p>Las siguientes acciones son irreversibles:</p>
          <button class="btn-danger" (click)="deleteAccount()">
            🗑️ Eliminar Cuenta
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2.5rem 2rem 2rem 2rem;
      border-radius: 1.2rem;
      box-shadow: 0 8px 32px rgba(44,62,80,0.10);
      margin-bottom: 2.2rem;
      color: white;
    }

    .user-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      color: white;
      border: 3px solid rgba(255,255,255,0.3);
    }

    .user-info h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      color: white;
    }

    .user-email {
      margin: 0 0 1rem 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .user-stats {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .user-stats .stat {
      background: rgba(255,255,255,0.15);
      padding: 0.3rem 0.8rem;
      border-radius: 15px;
      font-size: 0.9rem;
      backdrop-filter: blur(10px);
    }

    .btn-edit {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 2px solid rgba(255,255,255,0.3);
      padding: 0.8rem 1.5rem;
      border-radius: 25px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .btn-edit:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-2px);
    }

    .profile-content {
      display: grid;
      gap: 2rem;
    }

    .profile-section {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      transition: transform 0.3s ease;
    }

    .profile-section:hover {
      transform: translateY(-2px);
    }

    .profile-section h3 {
      margin: 0 0 1.5rem 0;
      color: #2c3e50;
      font-size: 1.3rem;
    }

    /* Estadísticas */
    .stats-section {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .stats-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .period-selector {
      padding: 0.5rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .period-selector:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn-refresh {
      padding: 0.5rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-refresh:hover:not(:disabled) {
      border-color: #667eea;
      background: #f8fafc;
    }

    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Loading */
    .stats-loading {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #e5e7eb;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Resumen */
    .stats-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      transition: transform 0.2s ease;
    }

    .summary-card:hover {
      transform: translateY(-2px);
    }

    .summary-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      color: white;
    }

    .summary-number {
      display: block;
      font-size: 1.8rem;
      font-weight: bold;
      color: #1f2937;
    }

    .summary-label {
      font-size: 0.9rem;
      color: #6b7280;
    }

    /* Gráficos */
    .chart-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }

    .chart-container h4 {
      margin: 0 0 1.5rem 0;
      color: #374151;
      font-size: 1.1rem;
    }

    /* Ranking de miembros */
    .member-ranking {
      display: grid;
      gap: 1rem;
    }

    .ranking-item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .ranking-item.top-performer {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border: 2px solid #f59e0b;
    }

    .ranking-item:hover {
      transform: translateX(4px);
    }

    .ranking-position {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .position-number {
      font-weight: bold;
      font-size: 1.2rem;
      color: #374151;
      width: 24px;
      text-align: center;
    }

    .position-medal {
      font-size: 1.5rem;
    }

    .member-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .member-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }

    .member-name {
      font-weight: 600;
      color: #1f2937;
    }

    .member-stats {
      min-width: 200px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .stats-numbers {
      display: flex;
      gap: 1rem;
      font-size: 0.9rem;
    }

    .points {
      color: #059669;
      font-weight: 600;
    }

    .tasks {
      color: #6b7280;
    }

    /* Actividad semanal */
    .weekly-chart {
      display: flex;
      justify-content: space-between;
      align-items: end;
      height: 150px;
      gap: 1rem;
      padding: 1rem 0;
    }

    .day-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      height: 100%;
    }

    .bar {
      width: 100%;
      min-height: 4px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 4px 4px 0 0;
      margin-bottom: auto;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .bar:hover {
      transform: scaleY(1.1);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .day-label {
      font-size: 0.8rem;
      color: #6b7280;
      margin-top: 0.5rem;
    }

    .day-count {
      font-size: 0.9rem;
      font-weight: 600;
      color: #374151;
      margin-top: 0.25rem;
    }

    /* Categorías */
    .category-chart {
      display: grid;
      gap: 1rem;
    }

    .category-item {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 1rem;
      align-items: center;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 120px;
    }

    .category-icon {
      font-size: 1.2rem;
    }

    .category-name {
      font-weight: 500;
      color: #374151;
      text-transform: capitalize;
    }

    .category-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .category-bar {
      flex: 1;
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }

    .category-fill {
      height: 100%;
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      border-radius: 6px;
      transition: width 0.3s ease;
    }

    .category-stats {
      display: flex;
      gap: 0.5rem;
      min-width: 80px;
      font-size: 0.9rem;
    }

    .category-count {
      font-weight: 600;
      color: #374151;
    }

    .category-percentage {
      color: #6b7280;
    }

    /* Logros */
    .achievements-container {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }

    .achievements-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .achievement-badge {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .achievement-badge.earned {
      border-color: #10b981;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
    }

    .achievement-badge:hover {
      transform: translateY(-2px);
    }

    .badge-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: #f3f4f6;
    }

    .achievement-badge.earned .badge-icon {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .badge-name {
      font-weight: 600;
      color: #374151;
      display: block;
      margin-bottom: 0.25rem;
    }

    .badge-progress {
      font-size: 0.9rem;
      color: #6b7280;
    }

    /* Estado vacío */
    .stats-empty {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .stats-empty h4 {
      color: #374151;
      margin-bottom: 0.5rem;
    }

    /* Otros estilos del componente original */
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #374151;
      font-weight: 600;
    }

    .form-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      transition: border-color 0.2s ease;
    }

    .form-group input:focus {
      outline: none;
      border-color: #667eea;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }

    .avatar-selector {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .avatar-option {
      width: 50px;
      height: 50px;
      border: 2px solid #e5e7eb;
      border-radius: 50%;
      background: white;
      cursor: pointer;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .avatar-option:hover,
    .avatar-option.selected {
      border-color: #667eea;
      background: #f0f4ff;
    }

    .btn-save, .btn-export, .btn-import, .btn-clear, .btn-danger {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .btn-save {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
    }

    .btn-export {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }

    .btn-import {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      color: white;
    }

    .btn-clear {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
    }

    .data-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
    }

    .danger-zone {
      border: 2px solid #fecaca;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }

    .danger-zone h3 {
      color: #dc2626;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .profile-header {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .ranking-item {
        grid-template-columns: 1fr;
        gap: 0.5rem;
        text-align: center;
      }

      .member-stats {
        min-width: 150px;
      }

      .data-actions,
      .form-actions {
        flex-direction: column;
      }

      .achievements-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isEditing = false;
  isSaving = false;
  editData: Partial<User> = {};

  // Estadísticas
  familyStats: FamilyStats | null = null;
  loadingStats = false;
  selectedPeriod = 'week';

  totalMembers$!: Observable<number>;
  totalTasks$!: Observable<number>;

  avatarOptions = ['😊', '👨', '👩', '👦', '👧', '🧑', '👴', '👵', '😎', '🤓', '😇', '🥳', '😋', '🤗'];

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private familyService: FamilyService,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {
    this.totalMembers$ = this.familyService.getMembers().pipe(map(members => members.length));
    this.totalTasks$ = this.taskService.getTasks().pipe(map(tasks => tasks.length));
  }

  ngOnInit() {
    this.loadUserProfile();
    this.loadFamilyStats();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadUserProfile() {
    const sub = this.authService.currentUser$.subscribe({
      next: (user: User | null) => {
        this.currentUser = user;
        this.editData = { ...user };
      },
      error: (error: any) => {
        console.error('Error loading user profile:', error);
        this.notificationService.showError('Error al cargar el perfil de usuario');
      }
    });
    this.subscriptions.push(sub);
  }

  loadFamilyStats() {
    this.loadingStats = true;

    const { startDate, endDate } = this.getPeriodDates();

    forkJoin({
      members: this.familyService.getMembers(),
      tasks: this.taskService.getTasks(),
      completedTasks: this.taskService.getCompletedTasksInDateRange(startDate, endDate)
    }).subscribe({
      next: ({ members, tasks, completedTasks }) => {
        this.familyStats = this.calculateFamilyStats(members, tasks, completedTasks, startDate, endDate);
        this.loadingStats = false;
      },
      error: (error) => {
        console.error('Error loading family stats:', error);
        this.notificationService.showError('Error al cargar las estadísticas familiares');
        this.loadingStats = false;
      }
    });
  }

  private calculateFamilyStats(members: any[], tasks: any[], completedTasks: any[], startDate: Date, endDate: Date): FamilyStats {
    const totalPoints = completedTasks.reduce((sum, task) => sum + (task.points || 0), 0);
    const totalTasks = completedTasks.length;

    // Miembros activos (que han completado al menos una tarea)
    const activeMemberIds = new Set(completedTasks.map(task => task.member_id));
    const activeMembersCount = activeMemberIds.size;

    // Promedio de tareas por día
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const avgTasksPerDay = daysDiff > 0 ? totalTasks / daysDiff : 0;

    // Ranking de miembros
    const memberStats = members.map(member => {
      const memberTasks = completedTasks.filter(task => task.member_id === member.id);
      const points = memberTasks.reduce((sum, task) => sum + (task.points || 0), 0);
      return {
        id: member.id,
        name: member.name,
        avatar: member.avatar,
        points,
        tasksCount: memberTasks.length
      };
    }).sort((a, b) => b.points - a.points);

    const maxPoints = Math.max(...memberStats.map(m => m.points), 1);

    // Actividad semanal
    const weeklyActivity = this.generateWeeklyActivity(completedTasks, startDate, endDate);
    const maxDailyTasks = Math.max(...weeklyActivity.map(day => day.tasks), 1);

    // Distribución por categorías
    const categoryMap = new Map();
    completedTasks.forEach(task => {
      const category = task.category || 'General';
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, points: 0 });
      }
      const stats = categoryMap.get(category);
      stats.count++;
      stats.points += task.points || 0;
    });

    const categoryDistribution = Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      count: stats.count,
      points: stats.points
    })).sort((a, b) => b.count - a.count);

    // Logros
    const achievements = this.generateAchievements(totalPoints, totalTasks, activeMembersCount, memberStats);

    return {
      totalPoints,
      totalTasks,
      activeMembersCount,
      avgTasksPerDay,
      maxPoints,
      maxDailyTasks,
      memberRanking: memberStats,
      weeklyActivity,
      categoryDistribution,
      achievements
    };
  }

  private generateWeeklyActivity(completedTasks: any[], startDate: Date, endDate: Date): Array<{date: string, tasks: number, points: number}> {
    const dailyStats = new Map();

    // Inicializar todos los días con 0
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dailyStats.set(dateStr, { tasks: 0, points: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Contar tareas por día
    completedTasks.forEach(task => {
      const dateStr = new Date(task.completed_at).toISOString().split('T')[0];
      if (dailyStats.has(dateStr)) {
        const stats = dailyStats.get(dateStr);
        stats.tasks++;
        stats.points += task.points || 0;
      }
    });

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      tasks: stats.tasks,
      points: stats.points
    }));
  }

  private generateAchievements(totalPoints: number, totalTasks: number, activeMembersCount: number, memberStats: any[]): Array<any> {
    const achievements = [
      {
        id: 'first_steps',
        name: 'Primeros Pasos',
        icon: '👶',
        description: 'Completa tu primera tarea',
        earned: totalTasks > 0,
        progress: Math.min(totalTasks, 1),
        target: 1
      },
      {
        id: 'team_player',
        name: 'Jugador de Equipo',
        icon: '👥',
        description: 'Toda la familia activa',
        earned: activeMembersCount >= memberStats.length && memberStats.length > 1,
        progress: activeMembersCount,
        target: memberStats.length
      },
      {
        id: 'century_club',
        name: 'Club de los 100',
        icon: '💯',
        description: 'Alcanza 100 puntos familiares',
        earned: totalPoints >= 100,
        progress: Math.min(totalPoints, 100),
        target: 100
      },
      {
        id: 'task_master',
        name: 'Maestro de Tareas',
        icon: '🏆',
        description: 'Completa 50 tareas',
        earned: totalTasks >= 50,
        progress: Math.min(totalTasks, 50),
        target: 50
      },
      {
        id: 'point_collector',
        name: 'Coleccionista',
        icon: '💎',
        description: 'Acumula 500 puntos',
        earned: totalPoints >= 500,
        progress: Math.min(totalPoints, 500),
        target: 500
      }
    ];

    return achievements;
  }

  private getPeriodDates(): { startDate: Date, endDate: Date } {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    switch (this.selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }

  refreshStats() {
    this.loadFamilyStats();
  }

  getPeriodLabel(): string {
    const labels = {
      week: 'Última Semana',
      month: 'Último Mes',
      '3months': 'Últimos 3 Meses',
      year: 'Último Año'
    };
    return labels[this.selectedPeriod as keyof typeof labels];
  }

  getMedal(position: number): string {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[position] || '';
  }

  getMemberProgressPercentage(points: number, maxPoints: number): number {
    return maxPoints > 0 ? (points / maxPoints) * 100 : 0;
  }

  getDayActivityPercentage(tasks: number, maxTasks: number): number {
    return maxTasks > 0 ? (tasks / maxTasks) * 100 : 0;
  }

  getDayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    return days[date.getDay()];
  }

  getCategoryIcon(category: string): string {
    const icons = {
      'hogar': '🏠',
      'cocina': '🍳',
      'limpieza': '🧹',
      'estudio': '📚',
      'ejercicio': '💪',
      'jardín': '🌱',
      'mascotas': '🐕',
      'compras': '🛒',
      'cuidado personal': '🧴',
      'general': '📝'
    };
    return icons[category.toLowerCase() as keyof typeof icons] || '📌';
  }

  getCategoryPercentage(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
  }

  // Métodos del perfil de usuario
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.editData = { ...this.currentUser };
    }
  }

  selectAvatar(avatar: string) {
    this.editData.avatar = avatar;
  }

  saveProfile() {
    if (!this.editData.username || !this.editData.email) {
      this.notificationService.showError('Por favor completa todos los campos requeridos');
      return;
    }

    this.isSaving = true;

    this.authService.updateUserProfile(this.editData).subscribe({
      next: (updatedUser: User) => {
        this.currentUser = updatedUser;
        this.isEditing = false;
        this.isSaving = false;
        this.notificationService.showSuccess('✅ Perfil actualizado exitosamente');
      },
      error: (error: any) => {
        console.error('Error updating profile:', error);
        this.notificationService.showError('❌ Error al actualizar el perfil');
        this.isSaving = false;
      }
    });
  }

  exportData(): void {
    try {
      // Crear un nuevo libro de trabajo
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Información del Usuario
      const userSheet = XLSX.utils.json_to_sheet([{
        'Nombre de Usuario': this.currentUser?.username,
        'Email': this.currentUser?.email,
        'Nombre de Familia': this.currentUser?.family_name,
        'Avatar': this.currentUser?.avatar,
        'Fecha de Registro': this.formatDate(this.currentUser?.created_at),
        'Último Acceso': this.formatDate(this.currentUser?.last_login),
        'Fecha de Exportación': new Date().toLocaleString('es-ES')
      }]);
      XLSX.utils.book_append_sheet(workbook, userSheet, 'Usuario');

      // Obtener todos los datos en paralelo
      forkJoin({
        members: this.familyService.getMembers(),
        tasks: this.taskService.getTasks(),
        completedTasks: this.taskService.getCompletedTasks()
      }).subscribe({
        next: ({ members, tasks, completedTasks }) => {
          // Hoja 2: Miembros de la Familia
          if (members && members.length > 0) {
            const membersData = members.map(member => ({
              'Nombre': member.name,
              'Avatar': member.avatar || '',
              'Puntos': member.total_points || 0,
              'Fecha de Creación': this.formatDate(member.created_at)
            }));
            const membersSheet = XLSX.utils.json_to_sheet(membersData);
            XLSX.utils.book_append_sheet(workbook, membersSheet, 'Miembros');
          }

          // Hoja 3: Tareas Disponibles
          if (tasks && tasks.length > 0) {
            const tasksData = tasks.map(task => ({
              'Nombre': task.name,
              'Descripción': task.description || '',
              'Puntos': task.points,
              'Categoría': task.category || '',
              'Icono': task.icon || '',
              'Es por Defecto': task.is_default ? 'Sí' : 'No',
              'Fecha de Creación': this.formatDate(task.created_at)
            }));
            const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
            XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tareas');
          }

          // Hoja 4: Historial de Tareas Completadas
          if (completedTasks && completedTasks.length > 0) {
            const completedData = completedTasks.map(completed => ({
              'Tarea': completed.task_name || 'N/A',
              'Miembro': completed.member_name || 'N/A',
              'Puntos': completed.points,
              'Notas': completed.notes || '',
              'Fecha de Completado': this.formatDate(completed.completed_at)
            }));
            const completedSheet = XLSX.utils.json_to_sheet(completedData);
            XLSX.utils.book_append_sheet(workbook, completedSheet, 'Tareas Completadas');
          }

          // Descargar el archivo
          const fileName = `family-points-backup-${new Date().toISOString().split('T')[0]}.xlsx`;
          XLSX.writeFile(workbook, fileName);

          this.notificationService.showSuccess('✅ Datos exportados a Excel - Tu respaldo ha sido descargado');
        },
        error: (error) => {
          console.error('Error al obtener datos para exportar:', error);
          this.notificationService.showError('❌ Error al obtener datos - No se pudo exportar');
        }
      });

    } catch (error) {
      console.error('Error al exportar datos:', error);
      this.notificationService.showError('❌ Error al exportar datos - No se pudo crear el archivo Excel');
    }
  }

  importData(): void {
    this.notificationService.showError('🚧 Función de importación en desarrollo');
  }

  clearAllData(): void {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción NO se puede deshacer.')) {
      this.notificationService.showError('🚧 Función de limpieza en desarrollo');
    }
  }

  deleteAccount(): void {
    if (confirm('⚠️ ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción NO se puede deshacer.')) {
      this.notificationService.showError('🚧 Función de eliminación de cuenta en desarrollo');
    }
  }

  private formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-ES');
  }

  getInitials(name: string | undefined): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Track by functions
  trackByAvatar(index: number, avatar: string): string {
    return avatar;
  }

  trackByMemberId(index: number, member: any): string {
    return member.id;
  }

  trackByDate(index: number, day: any): string {
    return day.date;
  }

  trackByCategory(index: number, category: any): string {
    return category.category;
  }

  trackByAchievement(index: number, achievement: any): string {
    return achievement.id;
  }
}
