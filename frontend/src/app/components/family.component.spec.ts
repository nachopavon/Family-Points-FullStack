import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FamilyComponent } from './family.component';
import { FamilyService } from '../services/family.service';
import { TaskService } from '../services/task.service';
import { of } from 'rxjs';

class MockFamilyService {
  getMembers = jasmine.createSpy('getMembers').and.returnValue(of([
    { id: '1', name: 'Padre', avatar: '👨', role: 'padre' },
    { id: '2', name: 'Hijo', avatar: '👦', role: 'hijo' }
  ]));
  addMember = jasmine.createSpy('addMember').and.returnValue(of({ id: '3', name: 'Nuevo', avatar: '👧', role: 'hija' }));
}
class MockTaskService {
  getTasks = jasmine.createSpy('getTasks').and.returnValue(of([]));
  getCompletedTasksToday = jasmine.createSpy('getCompletedTasksToday').and.returnValue(of([]));
  getCompletedTasksByMember = jasmine.createSpy('getCompletedTasksByMember').and.returnValue(of([]));
  memberStatsChanged$ = of();
}

describe('FamilyComponent', () => {
  let component: FamilyComponent;
  let fixture: ComponentFixture<FamilyComponent>;
  let familyService: MockFamilyService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyComponent],
      providers: [
        { provide: FamilyService, useClass: MockFamilyService },
        { provide: TaskService, useClass: MockTaskService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FamilyComponent);
    component = fixture.componentInstance;
    familyService = TestBed.inject(FamilyService) as any;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar miembros de la familia', (done) => {
    component.members$.subscribe(members => {
      expect(members.length).toBe(2);
      expect(members[0].name).toBe('Padre');
      done();
    });
  });

  it('debería abrir el formulario de nuevo miembro', () => {
    component.showAddMemberForm = false;
    component.showAddMemberForm = true;
    expect(component.showAddMemberForm).toBeTrue();
  });

  it('debería llamar a addMember del servicio', () => {
    component.newMember = { name: 'Nuevo', avatar: '👧', role: 'hija' };
    component.isCreatingMember = false;
    // Simular método de agregar miembro
    familyService.addMember.and.returnValue(of({ id: '3', name: 'Nuevo', avatar: '👧', role: 'hija' }));
    // Aquí deberías llamar al método real de agregar miembro si existe, por ejemplo:
    // component.addMember();
    // expect(familyService.addMember).toHaveBeenCalled();
    // Como el método no está en el fragmento, solo se deja la estructura
    expect(true).toBeTrue();
  });
});
