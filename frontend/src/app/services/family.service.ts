import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, map } from 'rxjs';
import { FamilyMember } from '../models/family-member.model';
import { NotificationService } from './notification.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {
  private membersSubject = new BehaviorSubject<FamilyMember[]>([]);
  private currentUserId: string | null = null;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {
    // No cargar miembros automáticamente hasta que se establezca el usuario
  }

  setCurrentUser(userId: string): void {
    this.currentUserId = userId;
    this.loadMembers();
  }

  clearCurrentUser(): void {
    this.currentUserId = null;
    this.membersSubject.next([]);
  }

  private loadMembers(): void {
    if (!this.currentUserId) return;

    this.apiService.get<FamilyMember[]>('/family/members')
      .subscribe({
        next: (members) => {
          this.membersSubject.next(members);
        },
        error: (error) => {
          console.error('Error loading family members:', error);
          this.notificationService.showError('Error al cargar los miembros de la familia');
        }
      });
  }

  getMembers(): Observable<FamilyMember[]> {
    return this.membersSubject.asObservable();
  }

  addMember(name: string, avatar?: string): Observable<FamilyMember> {
    const memberData = {
      name,
      avatar: avatar || '👤'
    };

    return this.apiService.post<FamilyMember>('/family/members', memberData)
      .pipe(
        tap(newMember => {
          const currentMembers = this.membersSubject.value;
          const updatedMembers = [...currentMembers, newMember];
          this.membersSubject.next(updatedMembers);
          this.notificationService.showSuccess(`¡${name} se ha unido a la familia! 👋`);
        }),
        catchError(error => {
          const message = error?.message || 'Error al agregar miembro';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  updateMember(memberId: string, updates: Partial<FamilyMember>): Observable<FamilyMember> {
    return this.apiService.put<FamilyMember>(`/family/members/${memberId}`, updates)
      .pipe(
        tap(updatedMember => {
          const currentMembers = this.membersSubject.value;
          const updatedMembers = currentMembers.map(member =>
            member.id === memberId ? updatedMember : member
          );
          this.membersSubject.next(updatedMembers);
          this.notificationService.showSuccess(`¡${updatedMember.name} actualizado exitosamente! ✨`);
        }),
        catchError(error => {
          const message = error?.message || 'Error al actualizar miembro';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  deleteMember(memberId: string): Observable<boolean> {
    return this.apiService.delete<{message: string}>(`/family/members/${memberId}`)
      .pipe(
        tap(() => {
          const currentMembers = this.membersSubject.value;
          const updatedMembers = currentMembers.filter(member => member.id !== memberId);
          this.membersSubject.next(updatedMembers);
          this.notificationService.showSuccess('Miembro eliminado de la familia 👋');
        }),
        map(() => true),
        catchError(error => {
          const message = error?.message || 'Error al eliminar miembro';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  updateMemberPoints(memberId: string, points: number): Observable<FamilyMember> {
    return this.apiService.put<FamilyMember>(`/family/members/${memberId}/points`, { points })
      .pipe(
        tap(updatedMember => {
          const currentMembers = this.membersSubject.value;
          const updatedMembers = currentMembers.map(member =>
            member.id === memberId ? updatedMember : member
          );
          this.membersSubject.next(updatedMembers);
        }),
        catchError(error => {
          const message = error?.message || 'Error al actualizar puntos';
          this.notificationService.showError(message);
          throw error;
        })
      );
  }

  getMemberById(memberId: string): Observable<FamilyMember | undefined> {
    return this.apiService.get<FamilyMember>(`/family/members/${memberId}`)
      .pipe(
        catchError(error => {
          console.error('Error getting member:', error);
          throw error;
        })
      );
  }

  refreshMembers(): void {
    this.loadMembers();
  }
}
