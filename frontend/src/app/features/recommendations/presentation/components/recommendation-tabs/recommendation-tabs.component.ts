import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RecommendationTab } from '../../../models/recommendation.model';

interface TabOption {
  readonly key: RecommendationTab;
  readonly label: string;
}

const TAB_OPTIONS: readonly TabOption[] = [
  { key: 'process', label: 'Proceso de fabricación' },
  { key: 'explanation', label: 'Nivel de complejidad' },
  { key: 'market', label: 'Análisis de mercado' }
];

@Component({
  selector: 'app-recommendation-tabs',
  standalone: true,
  templateUrl: './recommendation-tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationTabsComponent {
  activeTab = input.required<RecommendationTab>();
  tabChanged = output<RecommendationTab>();

  protected readonly tabs = TAB_OPTIONS;

  onChangeTab(tab: RecommendationTab): void {
    this.tabChanged.emit(tab);
  }
}
