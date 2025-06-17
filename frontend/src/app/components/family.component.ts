import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, map, combineLatest, Subscription } from 'rxjs';
import { FamilyMember } from '../models/family-member.model';
import { FamilyService } from '../services/family.service';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent implements OnInit, OnDestroy {
  members$: Observable<FamilyMember[]>;
  showAddMemberForm = false;
  editingMember: FamilyMember | null = null;
  isCreatingMember = false;
  isSaving = false;

  private subscriptions: Subscription[] = [];

  newMember: Partial<FamilyMember> = {
    name: '',
    avatar: '',
    role: ''
  };

  // Cache para tareas completadas hoy por miembro
  memberTasksToday: { [memberId: string]: number } = {};
  memberStats: { [memberId: string]: { points: number; tasks: number } } = {};

  // Propiedades para compatibilidad con el HTML original
  newMemberName = '';
  newMemberAvatar = '';
  customAvatar = '';
  selectedAvatarCategory = 'people';

  // Categorías de avatares
  avatarCategories = [
    { key: 'people', name: 'Personas', icon: '👥' },
    { key: 'family', name: 'Familia', icon: '👨‍👩‍👧‍👦' },
    { key: 'animals', name: 'Animales', icon: '🐶' },
    { key: 'fantasy', name: 'Fantasía', icon: '🦄' },
    { key: 'objects', name: 'Objetos', icon: '🎭' }
  ];

  // Avatares por categoría
  avatarsByCategory = {
    people: ['😊', '😄', '😎', '🤓', '😇', '🙂', '😋', '🤗', '🤔', '😌', '😍', '🥰', '😘', '🤭', '🤫', '🤨', '😏', '😅', '😂', '🤣'],
    family: ['👨', '👩', '👦', '👧', '🧑', '👴', '👵', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👦', '👨‍👧', '👩‍👦', '👩‍👧', '👨‍👨‍👦', '👩‍👩‍👧', '👨‍👨‍👧‍👦', '👩‍👩‍👦‍👦'],
    animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅'],
    fantasy: ['🦄', '🐉', '🧚', '🧞', '🧙', '🎭', '👑', '🌟', '⭐', '✨', '🎪', '🎨', '🎭', '🎯', '🎲', '🎸', '🎵', '🎶', '🎤', '🎧'],
    objects: ['🎮', '⚽', '🏀', '🎾', '🏐', '🏈', '🏓', '🏸', '🏑', '🏒', '⛳', '🏹', '🎣', '🛹', '🛼', '🎿', '⛷️', '🏂', '🏌️', '🏋️']
  };

  avatarOptions = ['😊', '😄', '👨', '👩', '👦', '👧', '🧑', '👴', '👵', '😎', '🤓', '😇'];

  constructor(
    private familyService: FamilyService,
    private taskService: TaskService
  ) {
    this.members$ = this.familyService.getMembers();
  }

  ngOnInit() {
    this.members$ = this.familyService.getMembers();
    // Cargar estadísticas de tareas para cada miembro
    this.loadMemberTaskStats();

    // Suscribirse a cambios en las estadísticas cuando se completen tareas
    const statsSub = this.taskService.memberStatsChanged$.subscribe(() => {
      this.refreshMemberStats();
    });
    this.subscriptions.push(statsSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadMemberTaskStats(): void {
    const membersSub = this.members$.subscribe(members => {
      members.forEach(member => {
        // Cargar el total de tareas completadas por el miembro
        const tasksSub = this.taskService.getCompletedTasksByMember(member.id).subscribe(completedTasks => {
          this.memberTasksToday[member.id] = completedTasks.length;
          this.updateMemberStats(member);
        });
        this.subscriptions.push(tasksSub);
      });
    });
    this.subscriptions.push(membersSub);
  }

  private updateMemberStats(member: FamilyMember): void {
    this.memberStats[member.id] = {
      points: member.total_points || 0,
      tasks: this.memberTasksToday[member.id] || 0
    };
  }

  // Método público para refrescar estadísticas (se puede llamar desde otros componentes)
  refreshMemberStats(): void {
    this.loadMemberTaskStats();
  }

  addMember() {
    if (!this.isValidMember()) return;

    this.isSaving = true;

    const memberToAdd = {
      name: this.newMember.name!,
      avatar: this.newMember.avatar || this.getInitials(this.newMember.name!)
    };

    this.familyService.addMember(memberToAdd.name, memberToAdd.avatar)
      .subscribe({
        next: () => {
          this.cancelAddMember();
          this.isSaving = false;
          this.loadMemberTaskStats();
        },
        error: (error) => {
          console.error('Error adding member:', error);
          this.isSaving = false;
        }
      });
  }

  editMember(member: FamilyMember) {
    this.editingMember = member;
    this.newMember = {
      name: member.name,
      avatar: member.avatar,
      role: member.role || ''
    };
    this.showAddMemberForm = true;
  }

  updateMember() {
    if (!this.isValidMember() || !this.editingMember) return;

    this.isSaving = true;

    // Por ahora solo actualizamos el nombre y avatar usando el método existente
    this.familyService.addMember(this.newMember.name!, this.newMember.avatar!)
      .subscribe({
        next: () => {
          this.cancelAddMember();
          this.isSaving = false;
          this.loadMemberTaskStats();
        },
        error: (error) => {
          console.error('Error updating member:', error);
          this.isSaving = false;
        }
      });
  }

  deleteMember(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este miembro?')) {
      this.familyService.deleteMember(id).subscribe({
        next: () => {
          // Actualizar cache de tareas
          delete this.memberTasksToday[id];
        },
        error: (error) => {
          console.error('Error deleting member:', error);
        }
      });
    }
  }

  cancelAddMember() {
    this.showAddMemberForm = false;
    this.editingMember = null;
    this.newMember = {
      name: '',
      avatar: '',
      role: ''
    };
    this.newMemberName = '';
    this.newMemberAvatar = '';
    this.customAvatar = '';
    this.selectedAvatarCategory = 'people';
  }

  closeFormIfClickedOutside(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.cancelAddMember();
    }
  }

  isValidMember(): boolean {
    return !!(this.newMember.name && this.newMember.name.trim());
  }

  selectAvatar(avatar: string) {
    this.newMember.avatar = avatar;
    this.newMemberAvatar = avatar; // Para compatibilidad
    this.customAvatar = '';
  }

  trackByAvatar(index: number, avatar: string): string {
    return avatar;
  }

  onCustomAvatarChange(value: string) {
    if (value.trim()) {
      this.newMemberAvatar = value.trim();
    }
  }

  getAvatarsByCategory(): string[] {
    return this.avatarsByCategory[this.selectedAvatarCategory as keyof typeof this.avatarsByCategory] || [];
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
    return this.memberTasksToday[memberId] || 0;
  }

  getLevel(points: number): number {
    return Math.floor(points / 50) + 1;
  }

  getProgressPercentage(points: number): number {
    const currentLevel = this.getLevel(points);
    const pointsInCurrentLevel = points % 50;
    return (pointsInCurrentLevel / 50) * 100;
  }

  trackByMemberId(index: number, member: FamilyMember): string {
    return member.id;
  }

  trackByEmoji(index: number, emoji: string): string {
    return emoji;
  }
}
