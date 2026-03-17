import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { MusicPlayerService } from '../../../core/media/music-player.service';
import { NoticeToastComponent } from '../../../shared/components/notice-toast/notice-toast.component';

@Component({
  selector: 'app-not-found-page',
  imports: [CommonModule, NoticeToastComponent],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent implements OnInit, OnDestroy {
  private static readonly NOTICE_DURATION_MS = 5000;

  private readonly authService = inject(AuthService);
  private readonly musicPlayer = inject(MusicPlayerService);
  private readonly router = inject(Router);
  private noticeTimerId: ReturnType<typeof setTimeout> | null = null;

  readonly isAuthenticated = this.authService.isAuthenticated();
  readonly showNotice = signal(this.isAuthenticated);
  readonly noticeMessage = signal(
    this.isAuthenticated ? 'Ya habías respondido bien!' : '',
  );
  readonly isMusicPlaying = this.musicPlayer.isPlaying;

  ngOnInit(): void {
    if (!this.isAuthenticated) {
      return;
    }

    this.noticeTimerId = setTimeout(() => {
      this.showNotice.set(false);
      this.noticeTimerId = null;
    }, NotFoundPageComponent.NOTICE_DURATION_MS);
  }

  ngOnDestroy(): void {
    if (this.noticeTimerId) {
      clearTimeout(this.noticeTimerId);
    }
  }

  goToFormulario(): void {
    void this.router.navigateByUrl('/formulario');
  }

  toggleMusic(): void {
    void this.musicPlayer.toggle();
  }
}
