import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../core/constants/app.constants';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { AuthFacade } from '../../auth/services/auth.facade';
import { ComplianceLevelsFacade } from './application/compliance-levels.facade';
import { ComplianceLevelAccordionComponent } from './presentation/components/compliance-level-accordion/compliance-level-accordion.component';
import { ComplianceSummaryCardComponent } from './presentation/components/compliance-summary-card/compliance-summary-card.component';

@Component({
  selector: 'app-compliance-levels-page',
  standalone: true,
  imports: [
    RouterLink,
    SectionHeaderComponent,
    CardComponent,
    EmptyStateComponent,
    ComplianceSummaryCardComponent,
    ComplianceLevelAccordionComponent
  ],
  providers: [ComplianceLevelsFacade],
  templateUrl: './presentation/compliance-levels.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplianceLevelsPageComponent implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  protected readonly facade = inject(ComplianceLevelsFacade);

  protected readonly profileRoute = APP_ROUTES.profile;
  protected readonly saving = signal(false);
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly expandedLevels = signal<Record<number, boolean>>({
    1: true,
    2: false,
    3: false,
    4: false
  });

  protected readonly levels = this.facade.levels;
  protected readonly overview = this.facade.overview;
  protected readonly showLevel0Banner = computed(() => this.facade.currentRegulationLevel() === 0);
  protected readonly canTransact = this.facade.canTransact;
  protected readonly helpMessage =
    'Gestiona tus evidencias por nivel. Los archivos se suben a storage y se guardan en tu perfil regulatorio.';
  protected readonly currentLevelLabel = computed(() =>
    this.overview().currentLevel === 0
      ? 'Nivel 0 - Solo exploracion'
      : this.levels().find((level) => level.id === this.overview().currentLevel)?.title ?? 'Nivel 1'
  );
  protected readonly nextLevelLabel = computed(() =>
    this.overview().nextLevel
      ? this.levels().find((level) => level.id === this.overview().nextLevel)?.title ?? `Nivel ${this.overview().nextLevel}`
      : this.overview().currentLevel === 0
        ? 'Nivel 1'
        : 'Maximo nivel alcanzado'
  );

  ngOnInit(): void {
    const userId = this.authFacade.user()?.id ?? 'anonymous';
    this.facade.initialize(userId);
  }

  ngOnDestroy(): void {
    this.facade.ngOnDestroy();
  }

  protected isExpanded(levelId: number): boolean {
    return Boolean(this.expandedLevels()[levelId]);
  }

  protected toggleLevel(levelId: number): void {
    this.expandedLevels.update((current) => ({
      ...current,
      [levelId]: !current[levelId]
    }));
  }

  protected saveDraft(): void {
    this.facade.saveDraft();
    this.saving.set(false);
    this.toastMessage.set('Cambios guardados correctamente.');
  }

  protected onFileSelected(requirementId: string, file: File): void {
    this.facade.attachFile(requirementId, file);
    this.toastMessage.set('Subiendo archivo...');
  }

  protected onRemoveFile(requirementId: string): void {
    this.facade.removeFile(requirementId);
    this.toastMessage.set('Archivo eliminado del borrador.');
  }

  protected dismissToast(): void {
    this.toastMessage.set(null);
  }
}
