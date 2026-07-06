import { Signal } from '@angular/core';

import { MusicPlayerService } from './music-player.service';

interface PlaylistTrack {
  title: string;
  src: string;
}

interface PlaylistMusicPlayerContract {
  tracks: Signal<PlaylistTrack[]>;
  currentTrackIndex: Signal<number>;
  selectTrack: (index: number) => Promise<void> | void;
}

class FakeAudio {
  static instances: FakeAudio[] = [];

  src: string;
  paused = true;
  loop = false;
  preload = 'none';
  volume = 1;

  private readonly listeners = new Map<string, Array<() => void>>();

  constructor(src: string) {
    this.src = src;
    FakeAudio.instances.push(this);
  }

  addEventListener(eventName: string, callback: () => void): void {
    const current = this.listeners.get(eventName) ?? [];
    current.push(callback);
    this.listeners.set(eventName, current);
  }

  async play(): Promise<void> {
    this.paused = false;
  }

  pause(): void {
    this.paused = true;
  }

  emit(eventName: string): void {
    for (const listener of this.listeners.get(eventName) ?? []) {
      listener();
    }
  }

  static reset(): void {
    FakeAudio.instances = [];
  }
}

describe('MusicPlayerService playlist expectations (RED)', () => {
  const originalAudio = globalThis.Audio;

  beforeEach(() => {
    FakeAudio.reset();
    globalThis.Audio = FakeAudio as unknown as typeof Audio;
  });

  afterEach(() => {
    globalThis.Audio = originalAudio;
  });

  it('expone una lista de canciones reproducibles desde la carpeta fija assets/audio', () => {
    const service =
      new MusicPlayerService() as unknown as PlaylistMusicPlayerContract;

    const tracks = service.tracks();

    expect(tracks.length).toBeGreaterThan(0);
    expect(tracks.every((track) => track.src.startsWith('assets/audio/'))).toBe(
      true,
    );
  });

  it('cuando termina una canción pasa automáticamente a la siguiente', async () => {
    const service =
      new MusicPlayerService() as unknown as PlaylistMusicPlayerContract;
    const audio = FakeAudio.instances[0];

    expect(audio).toBeTruthy();

    await service.selectTrack(0);
    audio.emit('ended');

    expect(service.currentTrackIndex()).toBe(1);
  });
});
