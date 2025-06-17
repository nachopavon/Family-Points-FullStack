import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoginCredentials, RegisterData } from '../models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements OnDestroy {
  currentTab: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = '';
  
  private subscription = new Subscription();

  loginData: LoginCredentials = {
    username: '',
    password: ''
  };

  registerData: RegisterData = {
    username: '',
    email: '',
    password: '',
    familyName: '',
    avatar: '👨'
  };

  avatarOptions = ['👨', '👩', '👧', '👦', '👴', '👵', '🧔', '👱‍♀️', '👱‍♂️', '🧑‍🦰', '👨‍🦱', '👩‍🦱'];

  demoUsers = [
    { familyName: 'Familia Demo', avatar: '👨', username: 'demo', password: 'demo123' }
  ];

  // Propiedades para validación de accesibilidad
  loginUsernameInvalid = false;
  loginPasswordInvalid = false;
  registerUsernameInvalid = false;
  registerEmailInvalid = false;
  registerFamilyInvalid = false;
  registerPasswordInvalid = false;

  constructor(private authService: AuthService) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setCurrentTab(tab: 'login' | 'register') {
    this.currentTab = tab;
    this.errorMessage = '';
    this.resetValidation();
  }

  private resetValidation() {
    this.loginUsernameInvalid = false;
    this.loginPasswordInvalid = false;
    this.registerUsernameInvalid = false;
    this.registerEmailInvalid = false;
    this.registerFamilyInvalid = false;
    this.registerPasswordInvalid = false;
  }

  selectAvatar(avatar: string) {
    this.registerData.avatar = avatar;
  }

  onLogin() {
    if (!this.validateLoginForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginSub = this.authService.login(this.loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login exitoso:', response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
        console.error('Error de login:', error);
      }
    });

    this.subscription.add(loginSub);
  }

  onRegister() {
    if (!this.validateRegisterForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerSub = this.authService.register(this.registerData).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Registro exitoso:', response);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error al crear la cuenta. Intenta nuevamente.';
        console.error('Error de registro:', error);
      }
    });

    this.subscription.add(registerSub);
  }

  loginAsDemo(user: any) {
    this.loginData.username = user.username;
    this.loginData.password = user.password;
    this.onLogin();
  }

  private validateLoginForm(): boolean {
    let isValid = true;

    if (!this.loginData.username.trim()) {
      this.loginUsernameInvalid = true;
      isValid = false;
    }

    if (!this.loginData.password.trim()) {
      this.loginPasswordInvalid = true;
      isValid = false;
    }

    if (!isValid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos.';
    }

    return isValid;
  }

  private validateRegisterForm(): boolean {
    let isValid = true;

    if (!this.registerData.username.trim()) {
      this.registerUsernameInvalid = true;
      isValid = false;
    }

    if (!this.registerData.email.trim() || !this.isValidEmail(this.registerData.email)) {
      this.registerEmailInvalid = true;
      isValid = false;
    }

    if (!this.registerData.familyName.trim()) {
      this.registerFamilyInvalid = true;
      isValid = false;
    }

    if (!this.registerData.password.trim() || this.registerData.password.length < 6) {
      this.registerPasswordInvalid = true;
      isValid = false;
    }

    if (!isValid) {
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Métodos para trackBy en ngFor (optimización)
  trackByAvatar(index: number, avatar: string): string {
    return avatar;
  }

  trackByUser(index: number, user: any): string {
    return user.username;
  }
}
