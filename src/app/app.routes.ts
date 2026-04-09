import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/shell/shell.component')
      .then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'chat',
        loadComponent: () => import('./features/chat/chat.component')
          .then(m => m.ChatComponent)
      },
      {
        path: 'documents',
        loadComponent: () => import('./features/documents/documents.component')
          .then(m => m.DocumentsComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/users.component')
          .then(m => m.UsersComponent),
        canActivate: [adminGuard]
      },
      { path: '', redirectTo: 'chat', pathMatch: 'full' }
    ]
  }
];