import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { FlashMessageService } from '../../../core/ui/flash-message.service';
import { MusicPlayerService } from '../../../core/media/music-player.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceSpy: jest.Mocked<Pick<AuthService, 'login'>>;
  let flashMessageSpy: jest.Mocked<Pick<FlashMessageService, 'consume'>>;
  let musicPlayerSpy: jest.Mocked<Pick<MusicPlayerService, 'toggle'>>;
  let router: Router;

  const fillValidForm = (): void => {
    component.form.setValue({
      firstKissDate: '2025-02-16',
      seriesE: 'E',
      seriesR: 'R',
      seriesL: 'L',
      seriesI: 'I',
      seriesN: 'N',
      seriesA: 'A',
      alfajoresL: 'L',
      alfajoresF: 'F',
      alfajoresA: 'A',
      alfajoresJ: 'J',
      alfajoresO: 'O',
      alfajoresR: 'R',
      alfajoresE: 'E',
      alfajoresS: 'S',
      llaverosL: 'L',
      llaverosA: 'A',
      llaverosV: 'V',
      llaverosE: 'E',
      llaverosR: 'R',
      llaverosO: 'O',
      llaverosS: 'S',
      anniversaryDate: '2025-04-17',
    });
  };

  beforeEach(async () => {
    authServiceSpy = {
      login: jest.fn().mockReturnValue(false),
    };
    flashMessageSpy = {
      consume: jest.fn().mockReturnValue(null),
    };
    musicPlayerSpy = {
      toggle: jest.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: MusicPlayerService,
          useValue: { isPlaying: signal(false), ...musicPlayerSpy },
        },
        { provide: FlashMessageService, useValue: flashMessageSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra notice informativo si se envía un formulario inválido', () => {
    component.onSubmit();

    expect(component.form.invalid).toBe(true);
    expect(component.notice()?.type).toBe('info');
    expect(component.notice()?.message).toContain('Qué pasa?');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('mapea las respuestas y navega a /carta cuando el login es válido', fakeAsync(() => {
    authServiceSpy.login.mockReturnValue(true);
    const navigateSpy = jest
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true);
    fillValidForm();

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      firstKissDate: '2025-02-16',
      anniversaryDate: '2025-04-17',
      firstSeries: 'MERLINA',
      ratedBookWord: 'ALFAJORES',
      sharedWord: 'LLAVEROS',
    });
    expect(component.notice()?.type).toBe('success');

    tick(2599);
    expect(navigateSpy).not.toHaveBeenCalled();

    tick(1);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('/carta');

    flush();
  }));

  it('muestra error y no navega cuando el login falla', fakeAsync(() => {
    authServiceSpy.login.mockReturnValue(false);
    const navigateSpy = jest
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true);
    fillValidForm();

    component.onSubmit();
    tick(2600);

    expect(component.notice()?.type).toBe('error');
    expect(component.notice()?.message).toContain('Te estoy viendo');
    expect(navigateSpy).not.toHaveBeenCalled();

    flush();
  }));

  it('renderiza el aviso consumido desde flash message en el template (@if)', () => {
    flashMessageSpy.consume.mockReturnValue({
      type: 'info',
      message: 'Mensaje desde guard',
    });

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.notice()?.message).toBe('Mensaje desde guard');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Mensaje desde guard',
    );
  });

  it('delegá el toggle de música al servicio', () => {
    component.toggleMusic();

    expect(musicPlayerSpy.toggle).toHaveBeenCalled();
  });
});
