import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { AuthService } from '../services/auth.service';
import { FamilyService } from '../services/family.service';
import { TaskService } from '../services/task.service';
import { NotificationService } from '../services/notification.service';
import { of } from 'rxjs';

class MockAuthService {
  currentUser$ = of({ id: '1', username: 'demo1', avatar: '👨' });
}
class MockFamilyService {
  getMembers = jasmine.createSpy('getMembers').and.returnValue(of([
    { id: '1', name: 'Padre', avatar: '👨', role: 'padre' },
    { id: '2', name: 'Hijo', avatar: '👦', role: 'hijo' }
  ]));
}
class MockTaskService {
  getTasks = jasmine.createSpy('getTasks').and.returnValue(of([]));
  getCompletedTasksInDateRange = jasmine.createSpy('getCompletedTasksInDateRange').and.returnValue(of([]));
}
class MockNotificationService {
  showSuccess = jasmine.createSpy('showSuccess');
  showError = jasmine.createSpy('showError');
}

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: FamilyService, useClass: MockFamilyService },
        { provide: TaskService, useClass: MockTaskService },
        { provide: NotificationService, useClass: MockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el usuario actual', () => {
    expect(component.currentUser?.username).toBe('demo1');
  });
});
