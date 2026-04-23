import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserRole } from '../../../core/models/app.models';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { passwordStrengthValidator } from '../../../shared/helpers/validators';
import { AuthFacade } from '../services/auth.facade';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, CardComponent],
  templateUrl: './register.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);

  protected readonly loading = this.authFacade.isLoading;
  protected readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordStrengthValidator]],
    profileType: ['company' as const, [Validators.required]],
    role: [UserRole.Buyer, [Validators.required]]
  });

  protected readonly roles = Object.values(UserRole);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.authFacade.register(this.form.getRawValue());
  }
}
