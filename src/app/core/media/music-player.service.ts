import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MusicPlayerService {
  private audio: HTMLAudioElement | null = null;
  private readonly trackPath = 'assets/audio/tunel-de-la-vida.mp3';
  private pausedByUser = false;

  readonly isPlaying = signal(false);
  readonly trackReady = signal(false);

  constructor() {
    if (typeof Audio === 'undefined') {
      return;
    }

    this.audio = new Audio(this.trackPath);
    this.audio.loop = true;
    this.audio.preload = 'auto';
    this.audio.volume = 0.35;

    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
    this.audio.addEventListener('ended', () => this.isPlaying.set(false));
    this.audio.addEventListener('canplaythrough', () =>
      this.trackReady.set(true),
    );
    this.audio.addEventListener('error', () => this.trackReady.set(false));
  }

  async ensureStartedFromUserGesture(): Promise<void> {
    if (!this.audio) {
      return;
    }

    if (this.pausedByUser || this.isPlaying()) {
      return;
    }

    try {
      await this.audio.play();
      this.isPlaying.set(true);
    } catch {
      this.isPlaying.set(false);
    }
  }

  async toggle(): Promise<void> {
    if (!this.audio) {
      return;
    }

    if (this.audio.paused) {
      this.pausedByUser = false;
      try {
        await this.audio.play();
      } catch {
        this.isPlaying.set(false);
      }
      return;
    }

    this.pausedByUser = true;
    this.audio.pause();
  }
}
