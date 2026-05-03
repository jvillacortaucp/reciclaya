import { AbstractControl, ValidationErrors } from '@angular/forms';

export function getFormError(control: AbstractControl | null, label: string): string {
  if (!control || !control.errors || !control.touched) {
    return '';
  }

  if (control.hasError('required')) {
    return `${label} es obligatorio.`;
  }

  if (control.hasError('email')) {
    return 'Ingresa un correo valido.';
  }

  if (control.hasError('min')) {
    return `${label} tiene un valor minimo invalido.`;
  }

  if (control.hasError('passwordStrength')) {
    return 'La contrasena debe tener 8 caracteres, 1 mayuscula y 1 numero.';
  }

  return 'Valor invalido.';
}

export function firstError(control: AbstractControl | null): ValidationErrors | null {
  return control?.errors ?? null;
}
