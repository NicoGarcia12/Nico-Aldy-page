import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-romantic-background',
  templateUrl: './romantic-background.component.html',
  styleUrl: './romantic-background.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RomanticBackgroundComponent {}
