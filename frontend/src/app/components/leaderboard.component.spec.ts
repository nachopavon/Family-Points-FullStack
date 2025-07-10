import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaderboardComponent } from './leaderboard.component';
import { FamilyService } from '../services/family.service';
import { TaskService } from '../services/task.service';
import { of } from 'rxjs';

class MockFamilyService {
  getMembers = jasmine.createSpy('getMembers').and.returnValue(of([
    { id: '1', name: 'Padre', avatar: '👨', total_points: 100 },
    { id: '2', name: 'Hijo', avatar: '👦', total_points: 50 }
  ]));
}
class MockTaskService {
  getCompletedTasks = jasmine.createSpy('getCompletedTasks').and.returnValue(of([
    { id: 't1', memberId: '1', completedAt: new Date() },
    { id: 't2', memberId: '2', completedAt: new Date() }
  ]));
  getCompletedTasksToday = jasmine.createSpy('getCompletedTasksToday').and.returnValue(of([]));
}

describe('LeaderboardComponent', () => {
  let component: LeaderboardComponent;
  let fixture: ComponentFixture<LeaderboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaderboardComponent],
      providers: [
        { provide: FamilyService, useClass: MockFamilyService },
        { provide: TaskService, useClass: MockTaskService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LeaderboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar miembros ordenados por puntos', (done) => {
    component.sortedMembers$.subscribe(members => {
      expect(members[0].total_points).toBeGreaterThanOrEqual(members[1].total_points);
      done();
    });
  });
});
