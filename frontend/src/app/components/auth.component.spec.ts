import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

// Mock AuthService
class MockAuthService {
  login = jasmine.createSpy('login').and.returnValue(of({ username: 'demo1' }));
  register = jasmine.createSpy('register').and.returnValue(of({ username: 'newuser' }));
}

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let authService: MockAuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent, FormsModule],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as any;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cambiar de pestaña a registro', () => {
    component.setCurrentTab('register');
    expect(component.currentTab).toBe('register');
  });

  it('debería llamar a login con credenciales válidas', () => {
    component.loginData = { username: 'demo1', password: 'demo123' };
    component.onLogin();
    expect(authService.login).toHaveBeenCalledWith({ username: 'demo1', password: 'demo123' });
  });

  it('debería mostrar error si login está vacío', () => {
    component.loginData = { username: '', password: '' };
    component.onLogin();
    expect(component.errorMessage).toContain('Por favor, completa todos los campos requeridos');
  });

  it('debería llamar a register con datos válidos', () => {
    component.setCurrentTab('register');
    component.registerData = {
      username: 'nuevo',
      email: 'nuevo@email.com',
      password: '123456',
      familyName: 'Familia Test',
      avatar: '👨'
    };
    component.onRegister();
    expect(authService.register).toHaveBeenCalled();
  });

  it('debería mostrar error si registro está vacío', () => {
    component.setCurrentTab('register');
    component.registerData = {
      username: '',
      email: '',
      password: '',
      familyName: '',
      avatar: '👨'
    };
    component.onRegister();
    expect(component.errorMessage).toContain('Por favor, completa todos los campos correctamente');
  });

  it('debería autocompletar demo user y llamar a loginAsDemo', () => {
    spyOn(component, 'onLogin');
    const demoUser = component.demoUsers[0];
    component.loginAsDemo(demoUser);
    expect(component.loginData.username).toBe('demo1');
    expect(component.onLogin).toHaveBeenCalled();
  });
});
