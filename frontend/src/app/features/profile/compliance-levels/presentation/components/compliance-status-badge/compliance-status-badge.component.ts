import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ComplianceLevelStatus, ComplianceRequirementStatus, ComplianceRiskLevel } from '../../../../../../core/regulatory/compliance-levels.models';

@Component({
  selector: 'app-compliance-status-badge',
  standalone: true,
  template: `
    <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" [class]="badgeClasses">
      {{ label }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplianceStatusBadgeComponent {
  @Input() kind: 'level' | 'requirement' | 'risk' = 'requirement';
  @Input() value: ComplianceLevelStatus | ComplianceRequirementStatus | ComplianceRiskLevel = 'pending';

  get label(): string {
    if (this.kind === 'level') {
      const labels: Record<ComplianceLevelStatus, string> = {
        locked: 'Bloqueado',
        available: 'Disponible',
        in_progress: 'En progreso',
        completed: 'Completado'
      };
      return labels[this.value as ComplianceLevelStatus];
    }

    if (this.kind === 'risk') {
      const labels: Record<ComplianceRiskLevel, string> = {
        low: 'Riesgo bajo',
        medium: 'Riesgo medio',
        medium_high: 'Riesgo medio-alto',
        high: 'Riesgo alto'
      };
      return labels[this.value as ComplianceRiskLevel];
    }

    const labels: Record<ComplianceRequirementStatus, string> = {
      pending: 'Pendiente',
      uploaded: 'Cargado',
      in_review: 'En revisión',
      approved: 'Aprobado',
      rejected: 'Rechazado'
    };
    return labels[this.value as ComplianceRequirementStatus];
  }

  get badgeClasses(): string {
    if (this.kind === 'level') {
      const classes: Record<ComplianceLevelStatus, string> = {
        locked: 'bg-slate-100 text-slate-600',
        available: 'bg-sky-100 text-sky-700',
        in_progress: 'bg-amber-100 text-amber-700',
        completed: 'bg-emerald-100 text-emerald-700'
      };
      return classes[this.value as ComplianceLevelStatus];
    }

    if (this.kind === 'risk') {
      const classes: Record<ComplianceRiskLevel, string> = {
        low: 'bg-emerald-100 text-emerald-700',
        medium: 'bg-cyan-100 text-cyan-700',
        medium_high: 'bg-amber-100 text-amber-700',
        high: 'bg-rose-100 text-rose-700'
      };
      return classes[this.value as ComplianceRiskLevel];
    }

    const classes: Record<ComplianceRequirementStatus, string> = {
      pending: 'bg-slate-100 text-slate-600',
      uploaded: 'bg-sky-100 text-sky-700',
      in_review: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-rose-100 text-rose-700'
    };
    return classes[this.value as ComplianceRequirementStatus];
  }
}
