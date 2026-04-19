import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        toast.error('Sesi berakhir. Silakan login kembali.');
      } else if (err.status === 403) {
        toast.error('Anda tidak memiliki izin untuk aksi ini.');
        router.navigate(['/chat']);
      } else if (err.status === 0) {
        toast.error('Tidak dapat terhubung ke server.');
      } else {
        const message = err.error?.message || `Terjadi kesalahan (${err.status})`;
        toast.error(message);
      }
      return throwError(() => err);
    })
  );
};
