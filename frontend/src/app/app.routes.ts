import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth.component';
import { LeaderboardComponent } from './components/leaderboard.component';
import { TasksComponent } from './components/tasks.component';
import { FamilyComponent } from './components/family.component';
import { UserProfileComponent } from './components/user-profile.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/leaderboard', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'register', component: AuthComponent },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
  { path: 'family', component: FamilyComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/leaderboard' }
];
