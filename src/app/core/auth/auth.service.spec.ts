import { TestBed } from '@angular/core/testing';

import { AUTH_SESSION_KEY, LOGIN_REFERENCE_DATA } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginFormData } from './auth.types';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.removeItem(AUTH_SESSION_KEY);
  });

  afterEach(() => {
    localStorage.removeItem(AUTH_SESSION_KEY);
  });

  it('guarda sesión cuando el login coincide con la referencia', () => {
    const loginResult = service.login({ ...LOGIN_REFERENCE_DATA });

    expect(loginResult).toBeTrue();
    expect(localStorage.getItem(AUTH_SESSION_KEY)).toBe('{"name":"Aldy"}');
  });

  it('no guarda sesión cuando el login es inválido', () => {
    const invalidPayload: LoginFormData = {
      ...LOGIN_REFERENCE_DATA,
      sharedWord: 'OTRA',
    };

    const loginResult = service.login(invalidPayload);

    expect(loginResult).toBeFalse();
    expect(localStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
  });

  it('acepta diferencias de mayúsculas/espacios en palabras de login', () => {
    const payload: LoginFormData = {
      firstKissDate: LOGIN_REFERENCE_DATA.firstKissDate,
      anniversaryDate: LOGIN_REFERENCE_DATA.anniversaryDate,
      firstSeries: '  merlina ',
      ratedBookWord: '  alfajores',
      sharedWord: 'llaveros  ',
    };

    const loginResult = service.login(payload);

    expect(loginResult).toBeTrue();
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logout elimina la sesión persistida', () => {
    localStorage.setItem(AUTH_SESSION_KEY, '{"name":"Aldy"}');

    service.logout();

    expect(localStorage.getItem(AUTH_SESSION_KEY)).toBeNull();
  });

  it('getSession devuelve null con JSON inválido', () => {
    localStorage.setItem(AUTH_SESSION_KEY, '{invalid-json}');

    expect(service.getSession()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('getSession devuelve null cuando falta nombre válido', () => {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ name: '   ' }));

    expect(service.getSession()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
