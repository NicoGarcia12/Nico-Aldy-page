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
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let flashMessageSpy: jasmine.SpyObj<FlashMessageService>;
  let musicPlayerSpy: jasmine.SpyObj<Pick<MusicPlayerService, 'toggle'>>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', [
      'logout',
      'getSession',
    ]);
    authServiceSpy.getSession.and.returnValue({ name: 'Aldy' });
    flashMessageSpy = jasmine.createSpyObj<FlashMessageService>(
      'FlashMessageService',
      ['consume'],
    );
    flashMessageSpy.consume.and.returnValue(null);
    musicPlayerSpy = jasmine.createSpyObj<Pick<MusicPlayerService, 'toggle'>>(
      'MusicPlayerService',
      ['toggle'],
    );
    musicPlayerSpy.toggle.and.returnValue(Promise.resolve());

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
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);

    component.logout();

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledOnceWith('/formulario');
  });

  it('muestra notice cuando el flash coincide y lo oculta por timeout', fakeAsync(() => {
    flashMessageSpy.consume.and.returnValue({
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
    flashMessageSpy.consume.and.returnValue({
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
