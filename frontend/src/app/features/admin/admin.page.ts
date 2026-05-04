import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import { CardComponent } from '../../shared/ui/card/card.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { AdminCompaniesRepository, AdminCompany } from './admin-companies.repository';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CardComponent, EmptyStateComponent, SectionHeaderComponent],
  template: `
    <ui-section-header
      title="Admin empresas"
      subtitle="Verifica o rechaza empresas registradas en ReciclaYa."
    />

    @if (error()) {
      <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error() }}
      </div>
    }

    @if (loading()) {
      <p class="text-sm text-slate-500">Cargando empresas...</p>
    } @else if (companies().length === 0) {
      <ui-empty-state title="Sin empresas" description="No hay empresas registradas para revisar." />
    } @else {
      <ui-card>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="text-left text-xs uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th class="px-3 py-3 font-semibold">Empresa</th>
                <th class="px-3 py-3 font-semibold">RUC</th>
                <th class="px-3 py-3 font-semibold">Estado</th>
                <th class="px-3 py-3 font-semibold">Creada</th>
                <th class="px-3 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700">
              @for (company of companies(); track company.id) {
                <tr>
                  <td class="px-3 py-3 font-medium text-slate-900">{{ company.businessName }}</td>
                  <td class="px-3 py-3">{{ company.ruc }}</td>
                  <td class="px-3 py-3">
                    <span class="rounded-full px-2.5 py-1 text-xs font-semibold" [class]="statusClass(company.verificationStatus)">
                      {{ statusLabel(company.verificationStatus) }}
                    </span>
                  </td>
                  <td class="px-3 py-3">{{ company.createdAt }}</td>
                  <td class="px-3 py-3">
                    <div class="flex justify-end gap-2">
                      <button
                        type="button"
                        class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                        [disabled]="updatingId() === company.id || company.verificationStatus === 'verified'"
                        (click)="verify(company.id)"
                      >
                        Verificar
                      </button>
                      <button
                        type="button"
                        class="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        [disabled]="updatingId() === company.id || company.verificationStatus === 'rejected'"
                        (click)="reject(company.id)"
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </ui-card>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminPageComponent implements OnInit {
  private readonly repository = inject(AdminCompaniesRepository);

  protected readonly companies = signal<readonly AdminCompany[]>([]);
  protected readonly loading = signal(false);
  protected readonly updatingId = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCompanies();
  }

  protected verify(id: string): void {
    this.updateVerification(id, 'verify');
  }

  protected reject(id: string): void {
    this.updateVerification(id, 'reject');
  }

  protected statusLabel(status: AdminCompany['verificationStatus']): string {
    switch (status) {
      case 'verified':
        return 'Verificada';
      case 'rejected':
        return 'Rechazada';
      default:
        return 'Pendiente';
    }
  }

  protected statusClass(status: AdminCompany['verificationStatus']): string {
    switch (status) {
      case 'verified':
        return 'bg-emerald-100 text-emerald-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  }

  private loadCompanies(): void {
    this.loading.set(true);
    this.error.set(null);

    this.repository
      .getCompanies()
      .pipe(
        catchError((error: unknown) => {
          this.error.set(getErrorMessage(error, 'No se pudieron cargar las empresas.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((companies) => this.companies.set(companies));
  }

  private updateVerification(id: string, action: 'verify' | 'reject'): void {
    this.updatingId.set(id);
    this.error.set(null);

    const request = action === 'verify' ? this.repository.verifyCompany(id) : this.repository.rejectCompany(id);
    request
      .pipe(
        catchError((error: unknown) => {
          this.error.set(getErrorMessage(error, 'No se pudo actualizar la empresa.'));
          return EMPTY;
        }),
        finalize(() => this.updatingId.set(null))
      )
      .subscribe((updatedCompany) => {
        this.companies.update((companies) =>
          companies.map((company) => (company.id === updatedCompany.id ? updatedCompany : company))
        );
      });
  }
}
