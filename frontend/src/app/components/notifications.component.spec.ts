import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationsComponent } from './notifications.component';
import { NotificationService } from '../services/notification.service';
import { of } from 'rxjs';

class MockNotificationService {
  notifications$ = of([
    { id: '1', message: 'Éxito', type: 'success' },
    { id: '2', message: 'Error', type: 'error' }
  ]);
  removeNotification = jasmine.createSpy('removeNotification');
}

describe('NotificationsComponent', () => {
  let component: NotificationsComponent;
  let fixture: ComponentFixture<NotificationsComponent>;
  let notificationService: MockNotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsComponent],
      providers: [
        { provide: NotificationService, useClass: MockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationsComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService) as any;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar notificaciones', () => {
    expect(component.notifications.length).toBe(2);
    expect(component.notifications[0].message).toBe('Éxito');
  });

  it('debería eliminar notificación al llamar a removeNotification', () => {
    component.removeNotification('1');
    expect(notificationService.removeNotification).toHaveBeenCalledWith('1');
  });
});
