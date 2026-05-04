import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideCircleAlert } from '@lucide/angular';
import { ProtectedActionService } from '../../services/protected-action.service';

@Component({
  selector: 'app-protected-action-modal',
  standalone: true,
  imports: [LucideCircleAlert],
  template: `
    @if (dialog().open) {
      <div class="fixed inset-0 z-[70] bg-slate-950/45 p-4" (click)="protectedActions.cancel()">
        <div class="grid min-h-full place-items-center">
          <div
            class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            (click)="$event.stopPropagation()">
            <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <svg lucideCircleAlert class="h-5 w-5"></svg>
            </div>

            <h3 class="text-2xl font-semibold text-slate-900">Para continuar necesitas iniciar sesión.</h3>
            <p class="mt-2 text-sm leading-relaxed text-slate-600">
              Crea una cuenta o inicia sesión para publicar, guardar búsquedas o generar pre-órdenes.
            </p>
            @if (dialog().actionName) {
              <p class="mt-2 text-sm font-medium text-slate-700">
                Acción: <span class="text-emerald-700">{{ dialog().actionName }}</span>
              </p>
            }

            <div class="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 cursor-pointer"
                (click)="protectedActions.cancel()">
                Cancelar
              </button>
              <button
                type="button"
                class="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 cursor-pointer"
                (click)="protectedActions.confirmRegister()">
                Crear cuenta
              </button>
              <button
                type="button"
                class="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 cursor-pointer"
                (click)="protectedActions.confirmLogin()">
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProtectedActionModalComponent {
  protected readonly protectedActions = inject(ProtectedActionService);
  protected readonly dialog = this.protectedActions.dialogState;
}

