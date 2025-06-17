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
  template: `
    <div class="auth-container">
      <div class="auth-content">
        <!-- Panel izquierdo - Bienvenida -->
        <div class="welcome-panel">
          <div class="welcome-content">
            <div class="logo-section">
              <div class="logo">🏆</div>
              <h1 class="app-title">Family Points</h1>
              <p class="app-subtitle">Planifica actividades familiares y gestiona puntos por tareas cotidianas</p>
            </div>

            <div class="illustration">
              <div class="family-icons">
                <div class="family-member dad">👨</div>
                <div class="family-member mom">👩</div>
                <div class="family-member kid">👧</div>
              </div>
              <div class="floating-elements">
                <div class="floating-star star1">⭐</div>
                <div class="floating-star star2">✨</div>
                <div class="floating-star star3">🌟</div>
              </div>
            </div>

            <div class="features">
              <div class="feature">
                <span class="feature-icon">📅</span>
                <span>Planifica eventos familiares</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🎯</span>
                <span>Asigna tareas y puntos</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🏆</span>
                <span>Compite en familia</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel derecho - Formularios -->
        <div class="form-panel">
          <div class="form-container">
            <div class="form-header">
              <h2>{{ currentTab === 'login' ? '¡Bienvenido de vuelta!' : '¡Únete a la diversión!' }}</h2>
              <p>{{ currentTab === 'login' ? 'Accede a tu cuenta familiar' : 'Crea tu cuenta familiar' }}</p>
            </div>

            <div class="auth-tabs">
              <button
                class="tab-button"
                [class.active]="currentTab === 'login'"
                (click)="setCurrentTab('login')">
                Iniciar Sesión
              </button>
              <button
                class="tab-button"
                [class.active]="currentTab === 'register'"
                (click)="setCurrentTab('register')">
                Registrarse
              </button>
            </div>

            <div class="form-wrapper">
              <!-- Formulario de Login -->
              <form *ngIf="currentTab === 'login'" (ngSubmit)="onLogin()" class="auth-form">
                <div class="form-fields">
                  <div class="form-group">
                    <label>👤 Usuario</label>
                    <input
                      type="text"
                      [(ngModel)]="loginData.username"
                      name="username"
                      placeholder="Tu nombre de usuario"
                      required>
                  </div>

                  <div class="form-group">
                    <label>🔒 Contraseña</label>
                    <input
                      type="password"
                      [(ngModel)]="loginData.password"
                      name="password"
                      placeholder="Tu contraseña"
                      required>
                  </div>
                </div>

                <button type="submit" class="btn-primary submit-btn" [disabled]="isLoading">
                  <span *ngIf="isLoading">🔄 Iniciando sesión...</span>
                  <span *ngIf="!isLoading">🚀 Iniciar Sesión</span>
                </button>
              </form>

              <!-- Formulario de Registro -->
              <form *ngIf="currentTab === 'register'" (ngSubmit)="onRegister()" class="auth-form">
                <div class="form-fields">
                  <div class="form-group">
                    <label>👤 Usuario</label>
                    <input
                      type="text"
                      [(ngModel)]="registerData.username"
                      name="regUsername"
                      placeholder="Elige un nombre de usuario"
                      required>
                  </div>

                  <div class="form-group">
                    <label>📧 Email</label>
                    <input
                      type="email"
                      [(ngModel)]="registerData.email"
                      name="email"
                      placeholder="tu@email.com"
                      required>
                  </div>

                  <div class="form-group">
                    <label>🏠 Nombre de tu Familia</label>
                    <input
                      type="text"
                      [(ngModel)]="registerData.familyName"
                      name="familyName"
                      placeholder="Familia González"
                      required>
                  </div>

                  <div class="form-group">
                    <label>🎭 Elige tu Avatar</label>
                    <div class="avatar-selector">
                      <button
                        type="button"
                        *ngFor="let avatar of avatarOptions; trackBy: trackByAvatar"
                        class="avatar-option"
                        [class.selected]="registerData.avatar === avatar"
                        (click)="selectAvatar(avatar)">
                        {{avatar}}
                      </button>
                    </div>
                  </div>

                  <div class="form-group">
                    <label>🔒 Contraseña</label>
                    <input
                      type="password"
                      [(ngModel)]="registerData.password"
                      name="regPassword"
                      placeholder="Crea una contraseña segura"
                      required>
                  </div>
                </div>

                <button type="submit" class="btn-primary submit-btn" [disabled]="isLoading">
                  <span *ngIf="isLoading">🔄 Creando cuenta...</span>
                  <span *ngIf="!isLoading">✨ Crear Cuenta</span>
                </button>
              </form>
            </div>

            <!-- Mensajes de error -->
            <div *ngIf="errorMessage" class="error-message">
              ⚠️ {{errorMessage}}
            </div>

            <!-- Usuarios de demo -->
            <div class="demo-section" *ngIf="currentTab === 'login'">
              <h3>👥 Familias de Demostración</h3>
              <p>Prueba con estas familias de ejemplo:</p>
              <div class="demo-users">
                <button
                  *ngFor="let user of demoUsers; trackBy: trackByUser"
                  class="demo-user-btn"
                  (click)="loginAsDemo(user)">
                  <span class="demo-avatar">{{user.avatar}}</span>
                  <span class="demo-name">{{user.familyName}}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      background: var(--background-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      position: relative;
      overflow: hidden;
    }

    .auth-container::before {
      content: '';
      position: absolute;
      width: 200px;
      height: 200px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      top: 10%;
      left: 10%;
      animation: float 6s ease-in-out infinite;
    }

    .auth-container::after {
      content: '';
      position: absolute;
      width: 150px;
      height: 150px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      bottom: 10%;
      right: 10%;
      animation: float 8s ease-in-out infinite reverse;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }

    .auth-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
      max-width: 1200px;
      height: 100vh;
      position: relative;
      z-index: 1;
    }

    .welcome-panel {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      position: relative;
      overflow: hidden;
      height: 100vh;
    }

    .welcome-content {
      text-align: center;
      max-width: 400px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .logo-section {
      margin-bottom: 3rem;
    }

    .logo {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-10px); }
      60% { transform: translateY(-5px); }
    }

    .app-title {
      font-size: 3rem;
      font-weight: 800;
      color: var(--text-white);
      margin-bottom: 1rem;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .app-subtitle {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
      font-weight: 400;
    }

    .illustration {
      margin: 3rem 0;
      position: relative;
    }

    .family-icons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .family-member {
      font-size: 3rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      animation: wiggle 3s ease-in-out infinite;
    }

    .family-member.dad { animation-delay: 0s; }
    .family-member.mom { animation-delay: 0.5s; }
    .family-member.kid { animation-delay: 1s; }

    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      75% { transform: rotate(-5deg); }
    }

    .floating-elements {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }

    .floating-star {
      position: absolute;
      font-size: 1.5rem;
      animation: twinkle 2s ease-in-out infinite;
    }

    .star1 { top: 20%; left: 20%; animation-delay: 0s; }
    .star2 { top: 60%; right: 20%; animation-delay: 0.7s; }
    .star3 { bottom: 30%; left: 60%; animation-delay: 1.4s; }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-white);
      font-weight: 500;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: var(--border-radius);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    /* Panel de formularios */
    .form-panel {
      background: var(--background-light);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      min-height: 100vh;
      padding: 2rem;
    }

    .form-container {
      width: 100%;
      max-width: 400px;
      height: 700px;
      animation: fadeInUp 0.8s ease-out;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      z-index: 5;
    }

    .form-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .form-header h2 {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .form-header p {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .auth-tabs {
      display: flex;
      background: rgba(255, 255, 255, 0.5);
      border-radius: var(--border-radius);
      padding: 4px;
      margin-bottom: 2rem;
      backdrop-filter: blur(10px);
    }

    .tab-button {
      flex: 1;
      padding: 12px 20px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
      color: var(--text-secondary);
      background: transparent;
    }

    .tab-button.active {
      background: var(--gradient-purple);
      color: var(--text-white);
      box-shadow: var(--shadow-soft);
      transform: translateY(-1px);
    }

    .form-wrapper {
      min-height: 450px;
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: visible;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      justify-content: space-between;
      animation: slideIn 0.3s ease-in-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .form-fields {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      justify-content: flex-start;
      margin-bottom: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
      margin-left: 4px;
    }

    .btn-primary {
      background: var(--gradient-purple);
      color: var(--text-white);
      border: none;
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: inherit;
      box-shadow: var(--shadow-soft);
      position: relative;
      z-index: 10;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      z-index: 11;
    }

    .btn-primary:active {
      transform: translateY(0);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .submit-btn {
      margin-top: 1.5rem;
      padding: 16px;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.5px;
      flex-shrink: 0;
      width: 100%;
      min-height: 56px;
      position: relative;
      z-index: 10;
    }

    .avatar-selector {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
      padding: 12px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: var(--border-radius);
      backdrop-filter: blur(10px);
    }

    .avatar-option {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.8);
      border: 2px solid transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .avatar-option:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 1);
      box-shadow: var(--shadow-soft);
    }

    .avatar-option.selected {
      border-color: var(--primary-purple);
      background: var(--gradient-purple);
      transform: scale(1.1);
      box-shadow: var(--shadow-card);
    }

    .error-message {
      background: linear-gradient(135deg, #ff6b6b, #ee5a52);
      color: var(--text-white);
      padding: 1rem;
      border-radius: var(--border-radius);
      text-align: center;
      margin-top: 1rem;
      font-weight: 500;
      box-shadow: var(--shadow-soft);
    }

    .demo-section {
      margin-top: 2.5rem;
      padding-top: 2rem;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .demo-section h3 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 1.125rem;
      font-weight: 700;
    }

    .demo-section p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .demo-users {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .demo-user-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--gradient-ocean);
      border-radius: var(--border-radius);
      transition: all 0.3s ease;
      font-weight: 600;
      color: var(--text-primary);
      box-shadow: var(--shadow-soft);
      position: relative;
      z-index: 1;
    }

    .demo-user-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-hover);
      z-index: 2;
    }

    .demo-avatar {
      font-size: 1.5rem;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .demo-name {
      flex: 1;
      text-align: left;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .auth-content {
        grid-template-columns: 1fr;
        height: auto;
      }
      .welcome-panel {
        display: none;
      }
      .form-panel {
        padding: 2rem 1rem;
      }
    }

    @media (max-width: 640px) {
      .form-container {
        max-width: 100%;
      }

      .app-title {
        font-size: 2rem;
      }

      .logo {
        font-size: 3rem;
      }

      .avatar-selector {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `]
})
export class AuthComponent implements OnDestroy {
  private subscription = new Subscription();

  currentTab: 'login' | 'register' = 'login';
  isLoading = false;
  errorMessage = '';

  loginData: LoginCredentials = {
    username: '',
    password: ''
  };

  registerData: RegisterData = {
    username: '',
    email: '',
    password: '',
    familyName: '',
    avatar: '👤'
  };

  avatarOptions = ['👤', '👨', '👩', '👦', '👧', '🧑', '👴', '👵', '🎭', '🦸', '👸', '🤴'];

  demoUsers = [
    { avatar: '👨‍👩‍👧‍👦', familyName: 'Familia Demo', username: 'demo1', password: 'demo123' }
  ];

  constructor(private authService: AuthService) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setCurrentTab(tab: 'login' | 'register'): void {
    this.currentTab = tab;
    this.errorMessage = '';
  }

  selectAvatar(avatar: string): void {
    this.registerData.avatar = avatar;
  }

  onLogin(): void {
    // Validaciones locales
    const validationError = this.validateLoginData();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.subscription.add(
      this.authService.login(this.loginData).subscribe({
        next: (user) => {

          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error;
          this.isLoading = false;
        }
      })
    );
  }

  onRegister(): void {
    // Validaciones locales
    const validationError = this.validateRegisterData();
    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.subscription.add(
      this.authService.register(this.registerData).subscribe({
        next: (user) => {
          // Automáticamente hacer login después del registro exitoso
          const loginCredentials = {
            username: this.registerData.username,
            password: this.registerData.password
          };

          this.subscription.add(
            this.authService.login(loginCredentials).subscribe({
              next: () => {
                this.isLoading = false;
                // El usuario ya está logueado, no necesitamos hacer nada más
              },
              error: (loginError) => {
                this.errorMessage = `Cuenta creada pero error al iniciar sesión: ${loginError}`;
                this.isLoading = false;
                // Cambiar a pestaña de login para que el usuario pueda intentar manualmente
                this.currentTab = 'login';
                this.loginData = loginCredentials;
              }
            })
          );
        },
        error: (error) => {
          this.errorMessage = error;
          this.isLoading = false;
        }
      })
    );
  }

  loginAsDemo(demoUser: any): void {
    this.loginData = {
      username: demoUser.username,
      password: demoUser.password
    };
    this.currentTab = 'login';
    this.errorMessage = '';

    // Intentar hacer login primero
    this.isLoading = true;
    this.subscription.add(
      this.authService.login(this.loginData).subscribe({
        next: (user) => {
          this.isLoading = false;
        },
        error: (error) => {
          // Si el login falla, intentar crear el usuario demo
          this.subscription.add(
            this.authService.register({
              username: demoUser.username,
              email: `${demoUser.username}@demo.com`,
              password: demoUser.password,
              familyName: demoUser.familyName,
              avatar: demoUser.avatar
            }).subscribe({
              next: () => {
                // Después del registro exitoso, hacer login
                this.subscription.add(
                  this.authService.login(this.loginData).subscribe({
                    next: () => {
                      this.isLoading = false;
                    },
                    error: (loginError) => {
                      this.errorMessage = loginError;
                      this.isLoading = false;
                    }
                  })
                );
              },
              error: (registerError) => {
                // Si el registro también falla, mostrar error
                this.errorMessage = registerError;
                this.isLoading = false;
              }
            })
          );
        }
      })
    );
  }

  trackByAvatar(index: number, avatar: string): string {
    return avatar;
  }

  trackByUser(index: number, user: any): string {
    return user.username;
  }

  private validateLoginData(): string | null {
    if (!this.loginData.username || !this.loginData.password) {
      return 'Por favor completa todos los campos';
    }

    if (this.loginData.username.trim().length === 0) {
      return 'El nombre de usuario no puede estar vacío';
    }

    if (this.loginData.password.length === 0) {
      return 'La contraseña no puede estar vacía';
    }

    return null;
  }

  private validateRegisterData(): string | null {
    // Verificar campos requeridos
    if (!this.registerData.username || !this.registerData.email ||
        !this.registerData.password || !this.registerData.familyName) {
      return 'Por favor completa todos los campos obligatorios';
    }

    // Validar nombre de usuario
    const username = this.registerData.username.trim();
    if (username.length < 3) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (username.length > 30) {
      return 'El nombre de usuario no puede tener más de 30 caracteres';
    }
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return 'El nombre de usuario solo puede contener letras y números';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      return 'Debe proporcionar un email válido';
    }

    // Validar contraseña
    if (this.registerData.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar nombre de familia
    const familyName = this.registerData.familyName.trim();
    if (familyName.length === 0) {
      return 'El nombre de familia es requerido';
    }
    if (familyName.length > 100) {
      return 'El nombre de familia no puede tener más de 100 caracteres';
    }

    return null;
  }
}
