import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { MusicPlayerService } from '../../../core/media/music-player.service';
import { LoginFormData } from '../../../core/auth/auth.types';
import { FlashMessageService } from '../../../core/ui/flash-message.service';
import {
  NoticeToastComponent,
  NoticeType,
} from '../../../shared/components/notice-toast/notice-toast.component';

const NOTICE_DURATION_MS = 5000;
const SUCCESS_NOTICE_DURATION_MS = 7000;
const SUCCESS_NAVIGATION_DELAY_MS = 2600;

interface Notice {
  type: NoticeType;
  message: string;
}

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, NoticeToastComponent],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly musicPlayer = inject(MusicPlayerService);
  private readonly flashMessage = inject(FlashMessageService);
  private readonly router = inject(Router);
  private noticeTimerId: ReturnType<typeof setTimeout> | null = null;
  private navigationTimerId: ReturnType<typeof setTimeout> | null = null;
  private navigationSubscription: Subscription | null = null;

  readonly notice = signal<Notice | null>(null);
  readonly isMusicPlaying = this.musicPlayer.isPlaying;

  readonly form = this.formBuilder.nonNullable.group({
    firstKissDate: ['', [Validators.required]],
    seriesE: ['', [Validators.required, Validators.maxLength(1)]],
    seriesR: ['', [Validators.required, Validators.maxLength(1)]],
    seriesL: ['', [Validators.required, Validators.maxLength(1)]],
    seriesI: ['', [Validators.required, Validators.maxLength(1)]],
    seriesN: ['', [Validators.required, Validators.maxLength(1)]],
    seriesA: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresL: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresF: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresA: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresJ: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresO: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresR: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresE: ['', [Validators.required, Validators.maxLength(1)]],
    alfajoresS: ['', [Validators.required, Validators.maxLength(1)]],
    llaverosL: ['', [Validators.required, Validators.maxLength(1)]],
    llaverosA: ['', [Validators.required, Validators.maxLength(1)]],
    llaverosV: ['', [Validators.required, Validators.maxLength(1)]],
    llaverosE: ['', [Validators.required, Validators.maxLength(1)]],
    llaverosR: ['', [Validators.required, Validators.maxLength(1)]],
    llaverosO: ['', [Validators.required, Validators.maxLength(1)]],
    llaverosS: ['', [Validators.required, Validators.maxLength(1)]],
    anniversaryDate: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.showFlashMessage();

    this.navigationSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.showFlashMessage());
  }

  onSubmit(): void {
    this.clearNotice();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.setNotice('info', 'Qué pasa? Algo no lo sabés? Mmmmm');
      return;
    }

    const formValue = this.form.getRawValue();
    const payload: LoginFormData = {
      firstKissDate: formValue.firstKissDate,
      anniversaryDate: formValue.anniversaryDate,
      firstSeries: this.composeWord([
        'M',
        formValue.seriesE,
        formValue.seriesR,
        formValue.seriesL,
        formValue.seriesI,
        formValue.seriesN,
        formValue.seriesA,
      ]),
      ratedBookWord: this.composeWord([
        'A',
        formValue.alfajoresL,
        formValue.alfajoresF,
        formValue.alfajoresA,
        formValue.alfajoresJ,
        formValue.alfajoresO,
        formValue.alfajoresR,
        formValue.alfajoresE,
        formValue.alfajoresS,
      ]),
      sharedWord: this.composeWord([
        'L',
        formValue.llaverosL,
        formValue.llaverosA,
        formValue.llaverosV,
        formValue.llaverosE,
        formValue.llaverosR,
        formValue.llaverosO,
        formValue.llaverosS,
      ]),
    };

    const isValid = this.authService.login(payload);

    if (!isValid) {
      this.setNotice('error', 'Te estoy viendo, si sos vos mmmm flojito che');
      return;
    }

    this.setNotice(
      'success',
      'Bieeeen, ahora mirá la sorpresa...',
      SUCCESS_NOTICE_DURATION_MS,
    );
    this.navigationTimerId = setTimeout(() => {
      void this.router.navigateByUrl('/carta');
      this.navigationTimerId = null;
    }, SUCCESS_NAVIGATION_DELAY_MS);
  }

  toggleMusic(): void {
    void this.musicPlayer.toggle();
  }

  ngOnDestroy(): void {
    if (this.noticeTimerId) {
      clearTimeout(this.noticeTimerId);
    }

    if (this.navigationTimerId) {
      clearTimeout(this.navigationTimerId);
    }

    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

  onSeriesInput(
    controlName: string,
    event: Event,
    nextInput?: HTMLInputElement,
  ): void {
    const input = event.target as HTMLInputElement;
    const normalizedValue = this.normalizeSingleCharacter(input.value);
    const control = this.form.get(controlName);
    if (!control) {
      return;
    }

    control.setValue(normalizedValue);
    input.value = normalizedValue;

    if (!normalizedValue) {
      return;
    }

    if (nextInput) {
      nextInput.focus();
      nextInput.select();
      return;
    }

    input.blur();
  }

  onSeriesBackspace(
    controlName: string,
    event: KeyboardEvent,
    previousInput?: HTMLInputElement,
  ): void {
    if (event.key !== 'Backspace') {
      return;
    }

    const control = this.form.get(controlName);
    if (!control) {
      return;
    }

    const currentValue = control.value as string;
    if (currentValue || !previousInput) {
      return;
    }

    previousInput.focus();
    previousInput.select();
  }

  private normalizeSingleCharacter(value: string): string {
    return value.trim().slice(-1).toUpperCase();
  }

  private composeWord(letters: string[]): string {
    return letters.join('').toUpperCase();
  }

  private setNotice(
    type: NoticeType,
    message: string,
    durationMs = NOTICE_DURATION_MS,
  ): void {
    this.notice.set({ type, message });

    if (this.noticeTimerId) {
      clearTimeout(this.noticeTimerId);
    }

    this.noticeTimerId = setTimeout(() => {
      this.notice.set(null);
      this.noticeTimerId = null;
    }, durationMs);
  }

  private clearNotice(): void {
    if (this.noticeTimerId) {
      clearTimeout(this.noticeTimerId);
      this.noticeTimerId = null;
    }
    this.notice.set(null);
  }

  private showFlashMessage(): void {
    const flash = this.flashMessage.consume();
    if (!flash) {
      return;
    }

    this.setNotice(flash.type, flash.message);
  }
}
