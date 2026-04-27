import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideCalendarDays } from '@lucide/angular';
import { DASHBOARD_PERIOD_OPTIONS } from '../../../data/dashboard-impact.constants';
import { DashboardPeriod } from '../../../models/dashboard-impact.model';

@Component({
  selector: 'app-dashboard-period-filter',
  standalone: true,
  imports: [LucideCalendarDays],
  templateUrl: './dashboard-period-filter.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPeriodFilterComponent {
  selectedPeriod = input.required<DashboardPeriod>();
  periodChanged = output<DashboardPeriod>();

  protected readonly options = DASHBOARD_PERIOD_OPTIONS;

  protected onChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    const value = target?.value ?? '';
    if (
      value === 'last_7_days' ||
      value === 'current_month' ||
      value === 'current_quarter' ||
      value === 'current_year'
    ) {
      this.periodChanged.emit(value);
    }
  }
}
