import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { LucideChevronDown, LucideChevronUp, LucideShieldCheck, LucideWaypoints } from '@lucide/angular';
import {
  ComplianceAcceptedFileType,
  ComplianceActorRequirementGroup,
  ComplianceRequirement,
  ComplianceRiskLevel,
  ComplianceWasteCategory
} from '../../../../../core/regulatory/compliance-levels.models';
import { RegulatoryLevel } from '../../../../../core/regulatory/regulatory.models';
import { RegulationHttpService } from '../../../../../core/regulatory/regulation-http.service';
import { RegulationLevelResponse } from '../../../../../core/regulatory/regulation-api.models';
import { catchError, of } from 'rxjs';

interface RecommendationRegularizationLevelViewModel {
  readonly id: RegulatoryLevel;
  readonly title: string;
  readonly subtitle: string;
  readonly regularizationLabel: string;
  readonly riskLevel: ComplianceRiskLevel;
  readonly riskLabel: string;
  readonly fiscalization: string;
  readonly objective: readonly string[];
  readonly traceabilityLabel: string;
  readonly traceabilityItems: readonly string[];
  readonly sellerRequirements: readonly ComplianceActorRequirementGroup[];
  readonly buyerRequirements: readonly ComplianceActorRequirementGroup[];
  readonly includedWasteCategories: readonly ComplianceWasteCategory[];
  readonly allowedValidations: readonly string[];
  readonly requiredValidations: readonly string[];
  readonly restrictions: readonly string[];
  readonly documentation: readonly ComplianceRequirement[];
  readonly legalRiskLabel: string;
  readonly legalRiskItems: readonly string[];
  readonly regulations: readonly string[];
}

@Component({
  selector: 'app-recommendation-regularization',
  standalone: true,
  imports: [NgClass, LucideChevronDown, LucideChevronUp, LucideShieldCheck, LucideWaypoints],
  templateUrl: './recommendation-regularization.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationRegularizationComponent implements OnInit {
  private readonly regulationHttpService = inject(RegulationHttpService);
  private readonly levelsFromApi = signal<readonly RegulationLevelResponse[]>([]);
  private readonly expandedLevels = signal<readonly RegulatoryLevel[]>([1]);

  protected readonly levels = computed<readonly RecommendationRegularizationLevelViewModel[]>(() =>
    this.levelsFromApi().map((level) => this.mapLevel(level))
  );

  ngOnInit(): void {
    this.regulationHttpService
      .getLevels()
      .pipe(catchError(() => of([] as readonly RegulationLevelResponse[])))
      .subscribe((levels) => {
        this.levelsFromApi.set(levels);
      });
  }

  protected isExpanded(levelId: RegulatoryLevel): boolean {
    return this.expandedLevels().includes(levelId);
  }

  protected toggleLevel(levelId: RegulatoryLevel): void {
    const expanded = this.expandedLevels();
    if (expanded.includes(levelId)) {
      this.expandedLevels.set(expanded.filter((id) => id !== levelId));
      return;
    }

    this.expandedLevels.set([...expanded, levelId].sort((a, b) => a - b));
  }

  protected trackByLevel(_: number, level: RecommendationRegularizationLevelViewModel): RegulatoryLevel {
    return level.id;
  }

  protected toneClasses(levelId: RegulatoryLevel): string {
    const classes = {
      0: 'border-slate-200 bg-slate-50/60',
      1: 'border-emerald-200 bg-emerald-50/60',
      2: 'border-cyan-200 bg-cyan-50/60',
      3: 'border-amber-200 bg-amber-50/60',
      4: 'border-rose-200 bg-rose-50/60'
    } as const;

    return classes[levelId];
  }

  protected riskBadgeClass(riskLevel: ComplianceRiskLevel): string {
    switch (riskLevel) {
      case 'high':
        return 'border border-rose-200 bg-rose-50 text-rose-700';
      case 'medium_high':
        return 'border border-amber-200 bg-amber-50 text-amber-700';
      case 'medium':
        return 'border border-cyan-200 bg-cyan-50 text-cyan-700';
      default:
        return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
    }
  }

  protected requirementPillClass(required: boolean): string {
    return required
      ? 'bg-rose-50 text-rose-700 border border-rose-100'
      : 'bg-slate-100 text-slate-600 border border-slate-200';
  }

  protected actorPillClass(actorType: ComplianceRequirement['actorType']): string {
    switch (actorType) {
      case 'seller':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'buyer':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-100';
      default:
        return 'bg-violet-50 text-violet-700 border border-violet-100';
    }
  }

  protected actorLabel(actorType: ComplianceRequirement['actorType']): string {
    switch (actorType) {
      case 'seller':
        return 'Vendedor';
      case 'buyer':
        return 'Comprador';
      default:
        return 'Ambos';
    }
  }

  protected acceptedFormatsLabel(types: readonly ComplianceAcceptedFileType[]): string {
    const labels = types.flatMap((type) => {
      switch (type) {
        case 'pdf':
          return ['PDF'];
        case 'document':
          return ['DOC', 'DOCX'];
        case 'image':
          return ['JPG', 'PNG', 'WEBP'];
        default:
          return [];
      }
    });

    return labels.join(', ');
  }

  protected trackByText(_: number, value: string): string {
    return value;
  }

  private mapLevel(level: RegulationLevelResponse): RecommendationRegularizationLevelViewModel {
    return {
      id: level.id as RegulatoryLevel,
      title: level.title,
      subtitle: level.subtitle,
      regularizationLabel: level.regularizationLabel,
      riskLevel: this.normalizeRiskLevel(level.riskLevel),
      riskLabel: this.getRiskLabel(this.normalizeRiskLevel(level.riskLevel)),
      fiscalization: level.fiscalization,
      objective: level.objective,
      traceabilityLabel: level.traceability.label,
      traceabilityItems: level.traceability.items,
      sellerRequirements: level.sellerRequirements,
      buyerRequirements: level.buyerRequirements,
      includedWasteCategories: level.includedWasteCategories,
      allowedValidations: level.platformValidations.allowed,
      requiredValidations: level.platformValidations.required,
      restrictions: level.restrictions,
      documentation: level.requirementsForUpload.map((requirement) => ({
        ...requirement,
        levelId: requirement.levelId as RegulatoryLevel
      })),
      legalRiskLabel: level.legalRisks.label,
      legalRiskItems: level.legalRisks.items,
      regulations: level.regulations
    };
  }

  private normalizeRiskLevel(value: string): ComplianceRiskLevel {
    const normalized = (value ?? '').toLowerCase();
    if (normalized === 'high') {
      return 'high';
    }
    if (normalized === 'medium_high' || normalized === 'medium-high') {
      return 'medium_high';
    }
    if (normalized === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  private getRiskLabel(riskLevel: ComplianceRiskLevel): string {
    switch (riskLevel) {
      case 'high':
        return 'Riesgo alto';
      case 'medium_high':
        return 'Riesgo medio alto';
      case 'medium':
        return 'Riesgo medio';
      default:
        return 'Riesgo bajo';
    }
  }
}
