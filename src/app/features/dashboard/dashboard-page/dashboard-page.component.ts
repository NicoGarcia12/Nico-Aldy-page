import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { MusicPlayerService } from '../../../core/media/music-player.service';
import { FlashMessageService } from '../../../core/ui/flash-message.service';
import {
  NoticeToastComponent,
  NoticeType,
} from '../../../shared/components/notice-toast/notice-toast.component';

const NOTICE_DURATION_MS = 5000;
const ALREADY_ANSWERED_MESSAGE = 'Ya habías respondido bien!';

interface Notice {
  type: NoticeType;
  message: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, NoticeToastComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly musicPlayer = inject(MusicPlayerService);
  private readonly flashMessage = inject(FlashMessageService);
  private readonly router = inject(Router);
  readonly session = this.authService.getSession();
  readonly notice = signal<Notice | null>(null);
  readonly isMusicPlaying = this.musicPlayer.isPlaying;

  ngOnInit(): void {
    this.showFlashMessage();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.showFlashMessage());
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigateByUrl('/formulario');
  }

  toggleMusic(): void {
    void this.musicPlayer.toggle();
  }

  private showFlashMessage(): void {
    const flash = this.flashMessage.consume();
    if (!flash || flash.message !== ALREADY_ANSWERED_MESSAGE) {
      return;
    }

    this.notice.set(flash);
    setTimeout(() => this.notice.set(null), NOTICE_DURATION_MS);
  }
}
