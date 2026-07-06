import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
  tick,
} from '@angular/core/testing';
import { Signal, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { FlashMessageService } from '../../../core/ui/flash-message.service';
import { MusicPlayerService } from '../../../core/media/music-player.service';
import { DashboardPageComponent } from './dashboard-page.component';

interface PlaylistTrackVm {
  title: string;
  src: string;
}

interface DashboardMusicPlayerContract {
  isPlaying: Signal<boolean>;
  tracks: Signal<PlaylistTrackVm[]>;
  currentTrackIndex: Signal<number>;
  toggle: () => Promise<void>;
  selectTrack: (index: number) => Promise<void> | void;
}

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;
  let authServiceSpy: jest.Mocked<Pick<AuthService, 'logout' | 'getSession'>>;
  let flashMessageSpy: jest.Mocked<Pick<FlashMessageService, 'consume'>>;
  let musicPlayerSpy: jest.Mocked<
    Pick<DashboardMusicPlayerContract, 'toggle' | 'selectTrack'>
  >;
  let playlistTracks: ReturnType<typeof signal<PlaylistTrackVm[]>>;
  let currentTrackIndex: ReturnType<typeof signal<number>>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = {
      logout: jest.fn(),
      getSession: jest.fn().mockReturnValue({ name: 'Aldy' }),
    };
    flashMessageSpy = {
      consume: jest.fn().mockReturnValue(null),
    };
    playlistTracks = signal<PlaylistTrackVm[]>([]);
    currentTrackIndex = signal(0);
    musicPlayerSpy = {
      toggle: jest.fn().mockResolvedValue(undefined),
      selectTrack: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: MusicPlayerService,
          useValue: {
            isPlaying: signal(false),
            tracks: playlistTracks,
            currentTrackIndex,
            ...musicPlayerSpy,
          },
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

  it('si hay más de una canción permite cambiar manualmente entre ellas', fakeAsync(() => {
    playlistTracks.set([
      { title: 'Te extraño', src: 'assets/audio/te-extrano.mp3' },
      { title: 'Ciudad', src: 'assets/audio/ciudad.mp3' },
    ]);

    fixture.detectChanges();

    const trackButtons = Array.from(
      fixture.nativeElement.querySelectorAll('button[data-track-index]'),
    ) as HTMLButtonElement[];

    const secondTrackButton = trackButtons.find((button) =>
      button.textContent?.includes('Ciudad'),
    );

    expect(trackButtons).toHaveLength(2);
    expect(secondTrackButton).toBeTruthy();

    secondTrackButton?.click();
    flush();

    expect(musicPlayerSpy.selectTrack).toHaveBeenCalledWith(1);
  }));

  it('si hay una sola canción no rompe la UI ni muestra selector duplicado', () => {
    playlistTracks.set([{ title: 'Única', src: 'assets/audio/unica.mp3' }]);

    expect(() => fixture.detectChanges()).not.toThrow();

    const trackButtons = fixture.nativeElement.querySelectorAll(
      'button[data-track-index]',
    );

    expect(trackButtons).toHaveLength(0);
  });
});
