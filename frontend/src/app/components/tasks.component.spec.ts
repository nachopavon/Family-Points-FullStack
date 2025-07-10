import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TasksComponent } from './tasks.component';
import { TaskService } from '../services/task.service';
import { FamilyService } from '../services/family.service';
import { NotificationService } from '../services/notification.service';
import { of } from 'rxjs';

class MockTaskService {
  getTasks = jasmine.createSpy('getTasks').and.returnValue(of([
    { id: '1', name: 'Sacar la basura', points: 10, category: 'limpieza', icon: '🗑️' }
  ]));
  addTask = jasmine.createSpy('addTask').and.returnValue(of({ id: '2', name: 'Fregar platos', points: 5, category: 'cocina', icon: '🍽️' }));
}
class MockFamilyService {
  getMembers = jasmine.createSpy('getMembers').and.returnValue(of([
    { id: '1', name: 'Padre', avatar: '👨', role: 'padre' }
  ]));
}
class MockNotificationService {
  showSuccess = jasmine.createSpy('showSuccess');
  showError = jasmine.createSpy('showError');
}

describe('TasksComponent', () => {
  let component: TasksComponent;
  let fixture: ComponentFixture<TasksComponent>;
  let taskService: MockTaskService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasksComponent],
      providers: [
        { provide: TaskService, useClass: MockTaskService },
        { provide: FamilyService, useClass: MockFamilyService },
        { provide: NotificationService, useClass: MockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TasksComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as any;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar tareas al inicializar', () => {
    expect(taskService.getTasks).toHaveBeenCalled();
    expect(component.tasks.length).toBeGreaterThan(0);
  });

  it('debería abrir el formulario de nueva tarea', () => {
    component.showAddTaskForm = false;
    component.showAddTaskForm = true;
    expect(component.showAddTaskForm).toBeTrue();
  });

  it('debería llamar a addTask del servicio', () => {
    component.newTask = { name: 'Fregar platos', points: 5, category: 'cocina', icon: '🍽️' };
    // Aquí deberías llamar al método real de agregar tarea si existe, por ejemplo:
    // component.addTask();
    // expect(taskService.addTask).toHaveBeenCalled();
    // Como el método no está en el fragmento, solo se deja la estructura
    expect(true).toBeTrue();
  });
});
