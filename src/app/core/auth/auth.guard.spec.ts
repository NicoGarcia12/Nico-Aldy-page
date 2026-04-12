import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { FlashMessageService } from '../ui/flash-message.service';
import { AuthService } from './auth.service';
import { authGuard, guestGuard } from './auth.guard';

describe('auth/guest guards', () => {
  let authServiceSpy: jest.Mocked<Pick<AuthService, 'isAuthenticated'>>;
  let flashMessageSpy: jest.Mocked<Pick<FlashMessageService, 'set'>>;
  let router: Router;
  const routeSnapshot = new ActivatedRouteSnapshot();
  const routerStateSnapshot = { url: '/carta' } as RouterStateSnapshot;

  beforeEach(() => {
    authServiceSpy = {
      isAuthenticated: jest.fn(),
    };
    flashMessageSpy = {
      set: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: FlashMessageService, useValue: flashMessageSpy },
      ],
    });

    router = TestBed.inject(Router);
  });

  it('authGuard permite navegación cuando hay sesión', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(routeSnapshot, routerStateSnapshot),
    );

    expect(result).toBe(true);
    expect(flashMessageSpy.set).not.toHaveBeenCalled();
  });

  it('authGuard redirige a /formulario si no hay sesión', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(routeSnapshot, routerStateSnapshot),
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/formulario');
    expect(flashMessageSpy.set).toHaveBeenCalledWith({
      type: 'info',
      message: 'Respondé primero unas cositas...',
    });
  });

  it('guestGuard permite navegación cuando no hay sesión', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard(routeSnapshot, routerStateSnapshot),
    );

    expect(result).toBe(true);
    expect(flashMessageSpy.set).not.toHaveBeenCalled();
  });

  it('guestGuard redirige a /carta si ya está autenticado', () => {
    authServiceSpy.isAuthenticated.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() =>
      guestGuard(routeSnapshot, routerStateSnapshot),
    );

    expect(router.serializeUrl(result as UrlTree)).toBe('/carta');
    expect(flashMessageSpy.set).toHaveBeenCalledWith({
      type: 'success',
      message: 'Ya habías respondido bien!',
    });
  });
});
