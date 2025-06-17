import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { FamilyMember } from '../models/family-member.model';
import { CompletedTask } from '../models/task.model';
import { FamilyService } from '../services/family.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="leaderboard-container">
      <h2>🏆 Ranking Familiar</h2>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-number">{{ (sortedMembers$ | async)?.length || 0 }}</div>
          <div class="stat-label">Miembros</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ todayTasks.length }}</div>
          <div class="stat-label">Tareas Hoy</div>
        </div>
      </div>

      <div class="leaderboard" *ngIf="sortedMembers$ | async as members">
        <div
          class="member-card"
          *ngFor="let member of members; let i = index; trackBy: trackByMemberId"
          [class.first-place]="i === 0"
          [class.second-place]="i === 1"
          [class.third-place]="i === 2"
        >
          <div class="rank">
            <span class="rank-number">{{ i + 1 }}</span>
            <span class="trophy" *ngIf="i === 0">🥇</span>
            <span class="trophy" *ngIf="i === 1">🥈</span>
            <span class="trophy" *ngIf="i === 2">🥉</span>
          </div>

          <div class="member-info">
            <div class="member-avatar">
              {{ member.avatar || getInitials(member.name) }}
            </div>
            <div class="member-details">
              <h3>{{ member.name }}</h3>
              <p class="member-points">{{ member.total_points }} puntos</p>
              <p class="member-tasks">{{ getMemberTasksToday(member.id) }} tareas hoy</p>
            </div>
          </div>

          <div class="points-badge">
            {{ member.total_points }}
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="(sortedMembers$ | async)?.length === 0">
        <div class="empty-icon">👨‍👩‍👧‍👦</div>
        <h3>¡Añade miembros a tu familia!</h3>
        <p>Comienza agregando miembros de la familia para empezar a competir por puntos.</p>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 30px;
      font-size: 2rem;
    }

    .stats-cards {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      justify-content: center;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 15px;
      text-align: center;
      min-width: 120px;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: bold;
    }

    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .leaderboard {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .member-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      border-radius: 15px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-left: 4px solid #e0e0e0;
    }

    .member-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .member-card.first-place {
      border-left-color: #ffd700;
      background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
    }

    .member-card.second-place {
      border-left-color: #c0c0c0;
      background: linear-gradient(135deg, #f8f8f8 0%, #ffffff 100%);
    }

    .member-card.third-place {
      border-left-color: #cd7f32;
      background: linear-gradient(135deg, #fff4e6 0%, #ffffff 100%);
    }

    .rank {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 20px;
      min-width: 50px;
    }

    .rank-number {
      font-size: 1.5rem;
      font-weight: bold;
      color: #666;
    }

    .trophy {
      font-size: 1.5rem;
      margin-top: 5px;
    }

    .member-info {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .member-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
      margin-right: 15px;
    }

    .member-details h3 {
      margin: 0 0 5px 0;
      color: #2c3e50;
      font-size: 1.2rem;
    }

    .member-points {
      margin: 0;
      color: #667eea;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .member-tasks {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .points-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 15px;
      border-radius: 25px;
      font-weight: bold;
      font-size: 1.1rem;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }

    .empty-state h3 {
      color: #2c3e50;
      margin-bottom: 10px;
    }

    @media (max-width: 768px) {
      .stats-cards {
        flex-direction: column;
        align-items: center;
      }

      .member-card {
        flex-direction: column;
        text-align: center;
        gap: 15px;
      }

      .member-info {
        flex-direction: column;
        gap: 10px;
      }

      .rank {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit, OnDestroy {
  members$: Observable<FamilyMember[]>;
  sortedMembers$: Observable<FamilyMember[]>;
  todayTasks: CompletedTask[] = [];
  private subscription = new Subscription();

  constructor(
    private familyService: FamilyService,
    private taskService: TaskService
  ) {
    this.members$ = this.familyService.getMembers();
    // Crear observable ordenado por puntos de mayor a menor
    this.sortedMembers$ = this.members$.pipe(
      map(members => members.sort((a, b) => b.total_points - a.total_points))
    );
  }

  ngOnInit() {
    this.subscription.add(
      this.taskService.getCompletedTasks().subscribe(completedTasks => {
        this.subscription.add(
          this.taskService.getCompletedTasksToday().subscribe(todayTasks => {
            this.todayTasks = todayTasks;
          })
        );
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getMemberTasksToday(memberId: string): number {
    return this.todayTasks.filter(task => task.member_id === memberId).length;
  }

  trackByMemberId(index: number, member: FamilyMember): string {
    return member.id;
  }
}
