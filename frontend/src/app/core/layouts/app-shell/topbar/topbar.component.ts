import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { LucideMenu, LucideSearch, LucideBell, LucideLeaf } from '@lucide/angular';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [LucideMenu, LucideSearch, LucideBell, LucideLeaf],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopbarComponent {
  toggleSidebar = output<void>();
}
