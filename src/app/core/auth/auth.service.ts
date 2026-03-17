import { Injectable } from '@angular/core';

import { AUTH_SESSION_KEY, LOGIN_REFERENCE_DATA } from './auth.constants';
import { LoginFormData, SessionData } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(formData: LoginFormData): boolean {
    if (!this.matchesReferenceData(formData)) {
      return false;
    }

    const session: SessionData = { name: 'Aldy' };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    return true;
  }

  logout(): void {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }

  isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  getSession(): SessionData | null {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as SessionData;
      if (!parsed.name?.trim()) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private matchesReferenceData(formData: LoginFormData): boolean {
    return (
      formData.firstKissDate.trim() === LOGIN_REFERENCE_DATA.firstKissDate &&
      formData.anniversaryDate.trim() ===
        LOGIN_REFERENCE_DATA.anniversaryDate &&
      this.normalizeText(formData.firstSeries) ===
        this.normalizeText(LOGIN_REFERENCE_DATA.firstSeries) &&
      this.normalizeText(formData.ratedBookWord) ===
        this.normalizeText(LOGIN_REFERENCE_DATA.ratedBookWord) &&
      this.normalizeText(formData.sharedWord) ===
        this.normalizeText(LOGIN_REFERENCE_DATA.sharedWord)
    );
  }

  private normalizeText(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }
}
