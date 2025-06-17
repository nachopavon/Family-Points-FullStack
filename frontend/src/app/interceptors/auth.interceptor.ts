import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  // Obtener token del localStorage
  const token = localStorage.getItem('family-points-token');

  // Clonar la request y agregar el token si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Continuar con la request y manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token inválido o expirado
        localStorage.removeItem('family-points-token');
        localStorage.removeItem('family-points-user');
        router.navigate(['/login']);
        notificationService.showError('Sesión expirada. Por favor, inicia sesión nuevamente.');
      } else if (error.status === 0) {
        // Error de conexión
        notificationService.showError('Error de conexión con el servidor');
      }

      return throwError(() => error);
    })
  );
};
