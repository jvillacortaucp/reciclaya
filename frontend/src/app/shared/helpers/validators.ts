import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl<string>
): ValidationErrors | null => {
  const value = control.value ?? '';
  const hasLength = value.length >= 8;
  const hasNumber = /\d/.test(value);
  const hasUpper = /[A-Z]/.test(value);

  return hasLength && hasNumber && hasUpper ? null : { passwordStrength: true };
};
