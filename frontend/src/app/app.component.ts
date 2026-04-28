import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProtectedActionModalComponent } from './core/components/protected-action-modal/protected-action-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProtectedActionModalComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}
