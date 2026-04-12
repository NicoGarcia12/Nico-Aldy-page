import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { FlashMessageService } from '../../../core/ui/flash-message.service';
import { MusicPlayerService } from '../../../core/media/music-player.service';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let authServiceSpy: jest.Mocked<Pick<AuthService, 'logout' | 'getSession'>>;
  let flashMessageSpy: jest.Mocked<Pick<FlashMessageService, 'consume'>>;
  let musicPlayerSpy: jest.Mocked<Pick<MusicPlayerService, 'toggle'>>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = {
      logout: jest.fn(),
      getSession: jest.fn().mockReturnValue({ name: 'Aldy' }),
    };
    flashMessageSpy = {
      consume: jest.fn().mockReturnValue(null),
    };
    musicPlayerSpy = {
      toggle: jest.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
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
    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ejecuta logout y redirige al formulario', () => {
    const navigateSpy = jest
      .spyOn(router, 'navigateByUrl')
      .mockResolvedValue(true);

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('/formulario');
  });

  it('muestra notice cuando el flash coincide y lo oculta por timeout', fakeAsync(() => {
    flashMessageSpy.consume.mockReturnValue({
      type: 'success',
      message: 'Ya habías respondido bien!',
    });

    (
      component as unknown as { showFlashMessage: () => void }
    ).showFlashMessage();

    expect(component.notice()?.message).toBe('Ya habías respondido bien!');

    tick(5000);
    expect(component.notice()).toBeNull();
  }));

  it('ignora flash messages con texto distinto al esperado', () => {
    flashMessageSpy.consume.mockReturnValue({
      type: 'success',
      message: 'Otro mensaje',
    });

    (
      component as unknown as { showFlashMessage: () => void }
    ).showFlashMessage();

    expect(component.notice()).toBeNull();
  });

  it('delegá el toggle de música al servicio', () => {
    component.toggleMusic();

    expect(musicPlayerSpy.toggle).toHaveBeenCalled();
  });
});
