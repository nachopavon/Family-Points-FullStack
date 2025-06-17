import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TasksComponent } from './components/tasks.component';
import { FamilyComponent } from './components/family.component';
import { LeaderboardComponent } from './components/leaderboard.component';
import { AuthComponent } from './components/auth.component';
import { UserProfileComponent } from './components/user-profile.component';
import { NotificationsComponent } from './components/notifications.component';
import { AuthService } from './services/auth.service';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    TasksComponent,
    FamilyComponent,
    LeaderboardComponent,
    AuthComponent,
    UserProfileComponent,
    NotificationsComponent
  ],
  templateUrl: './app.html', // Cambiado para usar el nuevo diseño
  styleUrl: './app.scss'
})
export class App implements OnInit, AfterViewInit, OnDestroy {
  protected title = 'Family Points';
  protected currentView: 'tasks' | 'family' | 'leaderboard' | 'profile' = 'tasks';
  protected isLoggedIn = false;
  protected currentUser: User | null = null;
  private subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Ocultar el loader inicial después de que Angular se inicialice
    this.hideInitialLoader();

    // Suscribirse al estado de autenticación
    this.subscription.add(
      this.authService.isLoggedIn$.subscribe(loggedIn => {
        this.isLoggedIn = loggedIn;
      })
    );

    // Suscribirse al usuario actual
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngAfterViewInit() {
    // Asegurar que el loader se oculte después de que la vista se renderice
    setTimeout(() => this.hideInitialLoader(), 100);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private hideInitialLoader() {
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }

  protected setCurrentView(view: 'tasks' | 'family' | 'leaderboard' | 'profile'): void {
    this.currentView = view;
  }
}
