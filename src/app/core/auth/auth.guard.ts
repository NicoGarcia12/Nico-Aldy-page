import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';
import { FlashMessageService } from '../ui/flash-message.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const flashMessage = inject(FlashMessageService);

  if (!authService.isAuthenticated()) {
    flashMessage.set({
      type: 'info',
      message: 'Respondé primero unas cositas...',
    });
    return router.createUrlTree(['/formulario']);
  }

  return true;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const flashMessage = inject(FlashMessageService);

  if (authService.isAuthenticated()) {
    flashMessage.set({
      type: 'success',
      message: 'Ya habías respondido bien!',
    });
    return router.createUrlTree(['/carta']);
  }

  return true;
};
