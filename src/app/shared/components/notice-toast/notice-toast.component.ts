import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';

export type NoticeType = 'info' | 'success' | 'error';

@Component({
  selector: 'app-notice-toast',
  imports: [CommonModule],
  templateUrl: './notice-toast.component.html',
  styleUrl: './notice-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticeToastComponent {
  readonly type = input.required<NoticeType>();
  readonly message = input.required<string>();
  readonly floating = input(false);
  readonly noticeElement =
    viewChild<ElementRef<HTMLParagraphElement>>('notice');

  constructor() {
    effect(() => {
      this.message();

      queueMicrotask(() => {
        const notice = this.noticeElement()?.nativeElement;
        if (!notice) {
          return;
        }

        notice.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest',
        });
        notice.focus({ preventScroll: true });
      });
    });
  }
}
