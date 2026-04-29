import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const HTML_OR_SCRIPT_PATTERN = /<[^>]*>|javascript:|data:text\/html|on\w+\s*=|<script\b/i;
const MULTIPLE_SPACES_PATTERN = /\s{2,}/g;

export const INPUT_PATTERNS = {
  businessName: /^[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9&.,\- ]*[A-Za-zÀ-ÿ0-9)]$/u,
  address: /^[A-Za-zÀ-ÿ0-9#/,.\- ]*[A-Za-zÀ-ÿ0-9)]$/u,
  personName: /^[A-Za-zÀ-ÿ]+(?:[ '-][A-Za-zÀ-ÿ]+)*$/u,
  jobTitle: /^[A-Za-zÀ-ÿ]+(?:[ -][A-Za-zÀ-ÿ]+)*$/u,
  phone: /^\+?\d{7,15}$/u,
  postalCode: /^\d{4,10}$/u,
  documentNumber: /^\d{8,12}$/u,
  numericOnly: /^\d+$/u
} as const;

export const passwordStrengthValidator: ValidatorFn = (
  control: AbstractControl<string>
): ValidationErrors | null => {
  const value = control.value ?? '';
  const hasLength = value.length >= 8;
  const hasNumber = /\d/.test(value);
  const hasUpper = /[A-Z]/.test(value);

  return hasLength && hasNumber && hasUpper ? null : { passwordStrength: true };
};

export function safePatternValidator(
  pattern: RegExp,
  errorKey: string,
  options?: { readonly requiresAlphaNumeric?: boolean; readonly requiresLetter?: boolean }
): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = normalizeWhitespace(control.value ?? '');
    if (!value) {
      return null;
    }

    if (containsHtmlOrScript(value)) {
      return { suspiciousContent: true };
    }

    if (!pattern.test(value)) {
      return { [errorKey]: true };
    }

    if (options?.requiresAlphaNumeric && !/[A-Za-zÀ-ÿ0-9]/u.test(value)) {
      return { notMeaningful: true };
    }

    if (options?.requiresLetter && !/[A-Za-zÀ-ÿ]/u.test(value)) {
      return { notMeaningful: true };
    }

    return null;
  };
}

export const safeBusinessNameValidator = safePatternValidator(INPUT_PATTERNS.businessName, 'invalidBusinessName', {
  requiresAlphaNumeric: true
});

export const safeAddressValidator = safePatternValidator(INPUT_PATTERNS.address, 'invalidAddress', {
  requiresAlphaNumeric: true
});

export const safePersonNameValidator = safePatternValidator(INPUT_PATTERNS.personName, 'invalidName', {
  requiresLetter: true
});

export const safeJobTitleValidator = safePatternValidator(INPUT_PATTERNS.jobTitle, 'invalidJobTitle', {
  requiresLetter: true
});

export const phoneValidator = safePatternValidator(INPUT_PATTERNS.phone, 'invalidPhone');
export const postalCodeValidator = safePatternValidator(INPUT_PATTERNS.postalCode, 'invalidPostalCode');
export const documentNumberValidator = safePatternValidator(INPUT_PATTERNS.documentNumber, 'invalidDocument');

export function longTextValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = normalizeWhitespace(control.value ?? '');
    if (!value) {
      return null;
    }

    if (containsHtmlOrScript(value)) {
      return { suspiciousContent: true };
    }

    if (value.length > maxLength) {
      return {
        maxlength: {
          requiredLength: maxLength,
          actualLength: value.length
        }
      };
    }

    if (!/[A-Za-zÀ-ÿ0-9]/u.test(value)) {
      return { notMeaningful: true };
    }

    return null;
  };
}

export function sanitizeInputValue(
  value: string,
  mode: 'businessName' | 'address' | 'personName' | 'jobTitle' | 'text'
): string {
  const stripped = stripHtml(value);
  switch (mode) {
    case 'businessName':
      return normalizeWhitespace(stripped.replace(/[^A-Za-zÀ-ÿ0-9&.,\- ]/gu, ''));
    case 'address':
      return normalizeWhitespace(stripped.replace(/[^A-Za-zÀ-ÿ0-9#/,.\- ]/gu, ''));
    case 'jobTitle':
      return normalizeWhitespace(stripped.replace(/[^A-Za-zÀ-ÿ -]/gu, ''));
    case 'text':
      return normalizeWhitespace(stripped.replace(/[<>]/g, ''));
    case 'personName':
    default:
      return normalizeWhitespace(stripped.replace(/[^A-Za-zÀ-ÿ' -]/gu, ''));
  }
}

export function sanitizeDigits(value: string, options?: { readonly allowLeadingPlus?: boolean }): string {
  const stripped = stripHtml(value);
  const hasLeadingPlus = !!options?.allowLeadingPlus && stripped.trim().startsWith('+');
  const digits = stripped.replace(/\D/g, '');
  return hasLeadingPlus ? `+${digits}` : digits;
}

export function stripHtml(value: string): string {
  return (value ?? '').replace(HTML_OR_SCRIPT_PATTERN, '');
}

function containsHtmlOrScript(value: string): boolean {
  return HTML_OR_SCRIPT_PATTERN.test(value);
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(MULTIPLE_SPACES_PATTERN, ' ');
}
