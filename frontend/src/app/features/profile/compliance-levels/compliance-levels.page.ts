import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_ROUTES } from '../../../core/constants/app.constants';
import { CardComponent } from '../../../shared/ui/card/card.component';
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
    1: false,
    2: true,
    3: false,
    4: false
  });

  protected readonly levels = this.facade.levels;
  protected readonly overview = this.facade.overview;
  protected readonly helpMessage =
    'Gestiona tus evidencias por nivel. La subida es local por ahora, pero la estructura ya queda lista para conectar validación real y storage.';
  protected readonly currentLevelLabel = computed(
    () => this.levels().find((level) => level.id === this.overview().currentLevel)?.title ?? 'Nivel 1'
  );
  protected readonly nextLevelLabel = computed(() =>
    this.overview().nextLevel
      ? this.levels().find((level) => level.id === this.overview().nextLevel)?.title ?? `Nivel ${this.overview().nextLevel}`
      : 'Máximo nivel alcanzado'
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
    this.toastMessage.set('Cambios guardados localmente. Luego podremos conectarlo a API y storage.');
  }

  protected onFileSelected(requirementId: string, file: File): void {
    this.facade.attachFile(requirementId, file);
    this.toastMessage.set('Archivo adjuntado localmente.');
  }

  protected onRemoveFile(requirementId: string): void {
    this.facade.removeFile(requirementId);
    this.toastMessage.set('Archivo eliminado del borrador.');
  }

  protected dismissToast(): void {
    this.toastMessage.set(null);
  }
}
