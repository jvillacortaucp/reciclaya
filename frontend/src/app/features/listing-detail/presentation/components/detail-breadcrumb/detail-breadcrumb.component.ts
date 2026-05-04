import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-detail-breadcrumb',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="flex" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <a [routerLink]="['/marketplace']" class="inline-flex items-center text-sm font-medium text-slate-600 hover:text-emerald-700">
            <svg class="w-4 h-4 mr-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
            </svg>
            {{ parent }}
          </a>
        </li>
        <li>
          <div class="flex items-center space-x-1.5">
            <svg class="w-3.5 h-3.5 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/>
            </svg>
            <span class="inline-flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{{ current }}</span>
          </div>
        </li>
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailBreadcrumbComponent {
  @Input() parent = 'Marketplace';
  @Input() current = 'Listing Detail';
  @Input() reference = '';
  @Output() readonly back = new EventEmitter<void>();
}
