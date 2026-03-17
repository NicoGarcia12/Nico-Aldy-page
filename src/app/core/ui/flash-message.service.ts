import { Injectable } from '@angular/core';

import { NoticeType } from '../../shared/components/notice-toast/notice-toast.component';

const FLASH_KEY = 'nico-aldy-flash-message';

export interface FlashMessage {
  type: NoticeType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class FlashMessageService {
  set(message: FlashMessage): void {
    sessionStorage.setItem(FLASH_KEY, JSON.stringify(message));
  }

  consume(): FlashMessage | null {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) {
      return null;
    }

    sessionStorage.removeItem(FLASH_KEY);

    try {
      const parsed = JSON.parse(raw) as FlashMessage;
      if (!parsed.message || !parsed.type) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }
}
