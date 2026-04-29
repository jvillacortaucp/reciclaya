import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FALLBACK_IMAGE_URL } from '../../core/constants/media.constants';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, EMPTY, finalize } from 'rxjs';
import { getErrorMessage } from '../../core/http/api-response.helpers';
import { MediaHttpRepository } from '../../core/media/media-http.repository';
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
          <section class="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
            <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Foto de perfil</p>
              <div class="mt-4 flex flex-col items-center gap-3">
                <div class="h-28 w-28 overflow-hidden rounded-full border border-slate-200 bg-white">
                  @if (avatarPreviewUrl()) {
                    <img [src]="avatarPreviewUrl()! || fallbackImage" [alt]="profile()!.fullName" class="h-full w-full object-cover" />
                  } @else {
                    <div class="grid h-full w-full place-items-center text-2xl font-bold text-slate-500">
                      {{ profile()!.fullName.slice(0, 1).toUpperCase() }}
                    </div>
                  }
                </div>
                <label class="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" (change)="onAvatarSelected($event)" />
                  {{ avatarUploading() ? 'Subiendo...' : 'Cambiar foto' }}
                </label>
                <p class="text-center text-xs text-slate-500">JPG, PNG o WEBP. Maximo 5 MB.</p>
              </div>
            </div>

            @if (profile()!.company) {
              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Logo de empresa</p>
                    <p class="mt-1 text-sm text-slate-500">Visible para tu perfil de empresa y futuros módulos.</p>
                  </div>
                  <label class="inline-flex cursor-pointer items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <input type="file" accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" class="hidden" (change)="onCompanyLogoSelected($event)" />
                    {{ logoUploading() ? 'Subiendo...' : 'Subir logo' }}
                  </label>
                </div>
                <div class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                  @if (logoPreviewUrl()) {
                    <img [src]="logoPreviewUrl()! || fallbackImage" [alt]="profile()!.company!.businessName" class="h-20 max-w-full object-contain" />
                  } @else {
                    <p class="text-sm text-slate-500">Aun no tienes logo cargado.</p>
                  }
                </div>
              </div>
            }
          </section>

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
export class ProfilePageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject(ProfileHttpRepository);
  private readonly mediaRepository = inject(MediaHttpRepository);
  private readonly authFacade = inject(AuthFacade);
  private avatarPreviewObjectUrl: string | null = null;
  private logoPreviewObjectUrl: string | null = null;

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly profile = signal<Profile | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly toastMessage = signal<string | null>(null);
  protected readonly avatarPreviewUrl = signal<string | null>(null);
  protected readonly logoPreviewUrl = signal<string | null>(null);
  protected readonly avatarUploading = signal(false);
  protected readonly logoUploading = signal(false);

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

  protected readonly fallbackImage = FALLBACK_IMAGE_URL;

  ngOnDestroy(): void {
    this.revokeAvatarPreview();
    this.revokeLogoPreview();
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
        this.authFacade.patchUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          role: profile.role,
          profileType: profile.profileType,
          status: profile.status,
          avatarUrl: profile.avatarUrl ?? null
        });
        this.toastMessage.set('Perfil actualizado correctamente.');
      });
  }

  protected onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    const validationError = this.validateImageFile(file);
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }

    this.errorMessage.set(null);
    this.revokeAvatarPreview();
    this.avatarPreviewObjectUrl = URL.createObjectURL(file);
    this.avatarPreviewUrl.set(this.avatarPreviewObjectUrl);
    this.avatarUploading.set(true);
    this.toastMessage.set(null);

    this.mediaRepository
      .uploadProfileAvatar(file)
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'No se pudo subir la foto de perfil.'));
          return EMPTY;
        }),
        finalize(() => this.avatarUploading.set(false))
      )
      .subscribe((asset) => {
        const current = this.profile();
        if (!current || !asset.url) {
          return;
        }

        const nextProfile: Profile = {
          ...current,
          avatarUrl: asset.url
        };

        this.profile.set(nextProfile);
        this.revokeAvatarPreview();
        this.avatarPreviewUrl.set(asset.url);
        this.authFacade.patchUser({ avatarUrl: asset.url });
        this.toastMessage.set('Foto de perfil actualizada correctamente.');
      });
  }

  protected onCompanyLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';

    if (!file) {
      return;
    }

    const validationError = this.validateImageFile(file);
    if (validationError) {
      this.errorMessage.set(validationError);
      return;
    }

    this.errorMessage.set(null);
    this.revokeLogoPreview();
    this.logoPreviewObjectUrl = URL.createObjectURL(file);
    this.logoPreviewUrl.set(this.logoPreviewObjectUrl);
    this.logoUploading.set(true);
    this.toastMessage.set(null);

    this.mediaRepository
      .uploadCompanyLogo(file)
      .pipe(
        catchError((error: unknown) => {
          this.errorMessage.set(getErrorMessage(error, 'No se pudo subir el logo de empresa.'));
          return EMPTY;
        }),
        finalize(() => this.logoUploading.set(false))
      )
      .subscribe((asset) => {
        const current = this.profile();
        if (!current || !current.company || !asset.url) {
          return;
        }

        this.profile.set({
          ...current,
          company: {
            ...current.company,
            logoUrl: asset.url
          }
        });
        this.revokeLogoPreview();
        this.logoPreviewUrl.set(asset.url);
        this.toastMessage.set('Logo de empresa actualizado correctamente.');
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
        this.avatarPreviewUrl.set(profile.avatarUrl ?? null);
        this.logoPreviewUrl.set(profile.company?.logoUrl ?? null);
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

  private validateImageFile(file: File): string | null {
    if (file.size > 5 * 1024 * 1024) {
      return 'La imagen supera el limite de 5 MB.';
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return 'Solo se permiten imagenes JPG, PNG o WEBP.';
    }

    return null;
  }

  private revokeAvatarPreview(): void {
    if (this.avatarPreviewObjectUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.avatarPreviewObjectUrl);
    }

    this.avatarPreviewObjectUrl = null;
  }

  private revokeLogoPreview(): void {
    if (this.logoPreviewObjectUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.logoPreviewObjectUrl);
    }

    this.logoPreviewObjectUrl = null;
  }
}
