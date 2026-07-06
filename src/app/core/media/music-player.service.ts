import { Injectable, signal } from '@angular/core';

export interface PlaylistTrack {
  title: string;
  src: string;
}

// ponytail: editá esta lista y dejá los mp3 en public/assets/audio/
const PLAYLIST_TRACKS: PlaylistTrack[] = [
  {
    title: 'Túnel de la vida',
    src: 'assets/audio/tunel-de-la-vida.mp3',
  },
  {
    title: 'Túnel de la vida (reemplazame)',
    src: 'assets/audio/tunel-de-la-vida.mp3',
  },
];

@Injectable({ providedIn: 'root' })
export class MusicPlayerService {
  private audio: HTMLAudioElement | null = null;
  private pausedByUser = false;

  readonly isPlaying = signal(false);
  readonly trackReady = signal(false);
  readonly tracks = signal<PlaylistTrack[]>(PLAYLIST_TRACKS);
  readonly currentTrackIndex = signal(0);

  constructor() {
    const firstTrack = this.tracks()[0];

    if (typeof Audio === 'undefined' || !firstTrack) {
      return;
    }

    this.audio = new Audio(firstTrack.src);
    this.audio.loop = false;
    this.audio.preload = 'auto';
    this.audio.volume = 0.35;

    this.audio.addEventListener('play', () => this.isPlaying.set(true));
    this.audio.addEventListener('pause', () => this.isPlaying.set(false));
    this.audio.addEventListener('ended', () => void this.playNextTrack());
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

  async selectTrack(index: number): Promise<void> {
    if (!this.audio || !this.isValidTrackIndex(index)) {
      return;
    }

    this.pausedByUser = false;
    this.setTrack(index);

    try {
      await this.audio.play();
      this.isPlaying.set(true);
    } catch {
      this.isPlaying.set(false);
    }
  }

  private async playNextTrack(): Promise<void> {
    const tracks = this.tracks();

    if (!this.audio || tracks.length === 0) {
      this.isPlaying.set(false);
      return;
    }

    if (tracks.length === 1) {
      this.isPlaying.set(false);
      return;
    }

    const nextIndex = (this.currentTrackIndex() + 1) % tracks.length;
    await this.selectTrack(nextIndex);
  }

  private setTrack(index: number): void {
    if (!this.audio) {
      return;
    }

    this.currentTrackIndex.set(index);
    this.trackReady.set(false);
    this.audio.src = this.tracks()[index].src;
    this.audio.currentTime = 0;

    if ('load' in this.audio && typeof this.audio.load === 'function') {
      this.audio.load();
    }
  }

  private isValidTrackIndex(index: number): boolean {
    return index >= 0 && index < this.tracks().length;
  }
}
