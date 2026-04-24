import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { AuthFacade } from '../auth/services/auth.facade';
import { Profile, UpdateProfilePayload } from './profile.models';
import { ProfileHttpRepository } from './profile-http.repository';

@Component({
  selector: 'app-profile-page',
  imports: [ReactiveFormsModule, SectionHeaderComponent, CardComponent],
  template: `
    <ui-section-header title="Perfil" subtitle="Gestiona tus datos de empresa y verificacion" />

    @if (toastMessage()) {
      <div class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {{ toastMessage() }}
      </div>
    }

    @if (errorMessage()) {
      <div class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {{ errorMessage() }}
      </div>
    }

    <ui-card>
      @if (loading()) {
        <p class="text-sm text-slate-600">Cargando perfil...</p>
      } @else if (profile()) {
        <form class="space-y-6" [formGroup]="form" (ngSubmit)="save()">
          <section class="grid gap-4 md:grid-cols-2">
            <label class="block">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nombre visible</span>
              <input
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                formControlName="fullName"
              />
            </label>

            <label class="block">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
              <input
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                [value]="profile()!.email"
                disabled
              />
            </label>

            <label class="block">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Rol</span>
              <input
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                [value]="profile()!.role"
                disabled
              />
            </label>

            <label class="block">
              <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de perfil</span>
              <input
                class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                [value]="profile()!.profileType"
                disabled
              />
            </label>
          </section>

          @if (profile()!.company) {
            <section class="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <h3 class="text-lg font-semibold text-slate-900">Datos de empresa</h3>
                <p class="text-sm text-slate-500">RUC y verificacion no son editables.</p>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">RUC</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" [value]="profile()!.company!.ruc" disabled />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Verificacion</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" [value]="profile()!.company!.verificationStatus" disabled />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Razon social</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="businessName" />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Telefono</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="mobilePhone" />
                </label>

                <label class="block md:col-span-2">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Direccion</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="address" />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Codigo postal</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="postalCode" />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Representante legal</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="legalRepresentative" />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Cargo</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="position" />
                </label>
              </div>
            </section>
          }

          @if (profile()!.personProfile) {
            <section class="space-y-4 border-t border-slate-100 pt-5">
              <div>
                <h3 class="text-lg font-semibold text-slate-900">Datos personales</h3>
                <p class="text-sm text-slate-500">Documento y verificacion no son editables.</p>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Documento</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" [value]="profile()!.personProfile!.documentNumber" disabled />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Verificacion</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" [value]="profile()!.personProfile!.verificationStatus" disabled />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nombres</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="firstName" />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Apellidos</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="lastName" />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Telefono</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="mobilePhone" />
                </label>

                <label class="block">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Codigo postal</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="postalCode" />
                </label>

                <label class="block md:col-span-2">
                  <span class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Direccion</span>
                  <input class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" formControlName="address" />
                </label>
              </div>
            </section>
          }

          <div class="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              class="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              [disabled]="saving()"
            >
              {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </div>
        </form>
      } @else {
        <p class="text-sm text-slate-600">No hay sesion activa.</p>
      }
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject(ProfileHttpRepository);
  private readonly authFacade = inject(AuthFacade);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly profile = signal<Profile | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly toastMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    mobilePhone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    postalCode: ['', [Validators.required]],
    businessName: [''],
    legalRepresentative: [''],
    position: [''],
    firstName: [''],
    lastName: ['']
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  protected save(): void {
    const current = this.profile();
    if (!current) {
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.errorMessage.set('Completa los campos requeridos.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);
    this.toastMessage.set(null);

    this.repository
      .updateProfile(this.buildPayload(current))
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'No se pudo guardar el perfil.'));
          return EMPTY;
        }),
        finalize(() => this.saving.set(false))
      )
      .subscribe((profile) => {
        this.profile.set(profile);
        this.patchForm(profile);
        this.authFacade.updateUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          profileType: profile.profileType,
          status: profile.status
        });
        this.toastMessage.set('Perfil actualizado correctamente.');
      });
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.repository
      .getProfile()
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'No se pudo cargar el perfil.'));
          return EMPTY;
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((profile) => {
        this.profile.set(profile);
        this.patchForm(profile);
      });
  }

  private patchForm(profile: Profile): void {
    const company = profile.company;
    const person = profile.personProfile;

    this.form.patchValue({
      fullName: profile.fullName,
      mobilePhone: company?.mobilePhone ?? person?.mobilePhone ?? '',
      address: company?.address ?? person?.address ?? '',
      postalCode: company?.postalCode ?? person?.postalCode ?? '',
      businessName: company?.businessName ?? '',
      legalRepresentative: company?.legalRepresentative ?? '',
      position: company?.position ?? '',
      firstName: person?.firstName ?? '',
      lastName: person?.lastName ?? ''
    });
  }

  private buildPayload(profile: Profile): UpdateProfilePayload {
    const value = this.form.getRawValue();

    if (profile.profileType === 'company') {
      return {
        fullName: value.fullName,
        mobilePhone: value.mobilePhone,
        address: value.address,
        postalCode: value.postalCode,
        company: {
          businessName: value.businessName,
          mobilePhone: value.mobilePhone,
          address: value.address,
          postalCode: value.postalCode,
          legalRepresentative: value.legalRepresentative,
          position: value.position
        }
      };
    }

    return {
      fullName: value.fullName,
      mobilePhone: value.mobilePhone,
      address: value.address,
      postalCode: value.postalCode,
      personProfile: {
        firstName: value.firstName,
        lastName: value.lastName,
        mobilePhone: value.mobilePhone,
        address: value.address,
        postalCode: value.postalCode
      }
    };
  }
}
