import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  LucideActivity,
  LucideBadgeDollarSign,
  LucideBrain,
  LucideClock3,
  LucideFactory,
  LucideLeaf,
  LucideShieldAlert,
  LucideSparkles,
  LucideWrench
} from '@lucide/angular';
import { ComplexityOverview, RecommendationProcess } from '../../../models/recommendation.model';

interface ComplexityItemViewModel {
  readonly label: string;
  readonly value: string;
  readonly icon: ComplexityItemIcon;
  readonly tone: 'emerald' | 'amber' | 'slate' | 'rose';
  readonly accentClass: string;
  readonly panelClass: string;
}

type ComplexityItemIcon = 'activity' | 'wrench' | 'brain' | 'clock' | 'dollar' | 'shield' | 'leaf';

@Component({
  selector: 'app-recommendation-complexity',
  standalone: true,
  imports: [
    NgClass,
    LucideActivity,
    LucideWrench,
    LucideBrain,
    LucideClock3,
    LucideBadgeDollarSign,
    LucideShieldAlert,
    LucideLeaf,
    LucideFactory,
    LucideSparkles
  ],
  templateUrl: './recommendation-complexity.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecommendationComplexityComponent {
  recommendation = input.required<RecommendationProcess>();

  protected readonly complexityOverview = computed<ComplexityOverview | null>(() => this.recommendation().complexityOverview ?? null);

  protected readonly items = computed<readonly ComplexityItemViewModel[]>(() => {
    const overview = this.complexityOverview();
    if (!overview) {
      return [];
    }

    return [
      this.createItem('Procesamiento requerido', this.getValue(overview.processingRequired), 'activity', 'emerald'),
      this.createItem('Equipos necesarios', this.getValue(overview.equipmentNeeded), 'wrench', 'slate'),
      this.createItem('Conocimiento tecnico', this.getValue(overview.technicalKnowledge), 'brain', 'amber'),
      this.createItem('Tiempo de transformacion', this.getValue(overview.transformationTime), 'clock', 'slate'),
      this.createItem('Costo estimado', this.getValue(overview.estimatedCost), 'dollar', 'amber'),
      this.createItem('Riesgo operativo', this.getValue(overview.operationalRisk), 'shield', 'rose'),
      this.createItem('Impacto ambiental positivo', this.getValue(overview.positiveEnvironmentalImpact), 'leaf', 'emerald')
    ];
  });

  protected readonly complexityLabel = computed<string>(() => {
    const complexity = this.recommendation().complexity;
    if (complexity === 'high') {
      return 'Alta';
    }
    if (complexity === 'medium') {
      return 'Media';
    }
    return 'Baja';
  });

  protected readonly complexityPercent = computed<number | null>(() => {
    const value = this.recommendation().environmentalSummary?.utilizationPercent;
    if (value === null || value === undefined || Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) {
      return null;
    }

    return Math.round(Number(value));
  });

  protected readonly complexityTone = computed<'emerald' | 'amber' | 'rose'>(() => {
    const complexity = this.recommendation().complexity;
    if (complexity === 'high') {
      return 'rose';
    }
    if (complexity === 'medium') {
      return 'amber';
    }
    return 'emerald';
  });

  protected readonly complexityBadgeClass = computed<string>(() => {
    const tone = this.complexityTone();
    if (tone === 'rose') {
      return 'border border-rose-200 bg-rose-50 text-rose-700';
    }
    if (tone === 'amber') {
      return 'border border-amber-200 bg-amber-50 text-amber-700';
    }
    return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
  });

  protected readonly complexityMeterClass = computed<string>(() => {
    const tone = this.complexityTone();
    if (tone === 'rose') {
      return 'bg-gradient-to-r from-rose-500 via-rose-400 to-rose-300';
    }
    if (tone === 'amber') {
      return 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-300';
    }
    return 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400';
  });

  private getValue(value: string | null | undefined): string {
    return value?.trim() || 'No se pudo obtener';
  }

  protected getCardLayoutClass(index: number): string {
    if (index === 0) {
      return 'md:col-span-2 2xl:col-span-7';
    }

    if (index === 6) {
      return 'md:col-span-2 2xl:col-span-5';
    }

    return '2xl:col-span-4';
  }

  protected getToneBarClass(tone: ComplexityItemViewModel['tone']): string {
    switch (tone) {
      case 'emerald':
        return 'from-emerald-500 via-emerald-300 to-transparent';
      case 'amber':
        return 'from-amber-500 via-amber-300 to-transparent';
      case 'rose':
        return 'from-rose-500 via-rose-300 to-transparent';
      default:
        return 'from-slate-500 via-slate-300 to-transparent';
    }
  }

  protected getDisplayIndex(index: number): string {
    return index < 9 ? `0${index + 1}` : String(index + 1);
  }

  private createItem(
    label: string,
    value: string,
    icon: ComplexityItemIcon,
    tone: ComplexityItemViewModel['tone']
  ): ComplexityItemViewModel {
    const styles = this.getToneStyles(tone);
    return {
      label,
      value,
      icon,
      tone,
      accentClass: styles.accentClass,
      panelClass: styles.panelClass
    };
  }

  private getToneStyles(tone: ComplexityItemViewModel['tone']): {
    accentClass: string;
    panelClass: string;
  } {
    switch (tone) {
      case 'rose':
        return {
          accentClass: 'bg-rose-50 text-rose-700 border border-rose-100',
          panelClass: 'from-white via-rose-50/40 to-white'
        };
      case 'amber':
        return {
          accentClass: 'bg-amber-50 text-amber-700 border border-amber-100',
          panelClass: 'from-white via-amber-50/40 to-white'
        };
      case 'emerald':
        return {
          accentClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
          panelClass: 'from-white via-emerald-50/40 to-white'
        };
      default:
        return {
          accentClass: 'bg-slate-100 text-slate-700 border border-slate-200',
          panelClass: 'from-white via-slate-50/50 to-white'
        };
    }
  }
}
