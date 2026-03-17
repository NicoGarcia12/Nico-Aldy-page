import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MusicPlayerService } from './core/media/music-player.service';
import { RomanticBackgroundComponent } from './shared/components/romantic-background/romantic-background.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RomanticBackgroundComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly musicPlayer = inject(MusicPlayerService);

  onUserActivity(): void {
    void this.musicPlayer.ensureStartedFromUserGesture();
  }
}
