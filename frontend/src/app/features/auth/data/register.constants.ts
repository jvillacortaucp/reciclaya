import { AccountType, AccountTypeOption, IntentOption, RegistrationIntent, RegisterStepItem } from '../domain/register.models';

export const REGISTER_PAGE_COPY = {
  badge: 'Onboarding circular inteligente',
  title: 'Crea tu cuenta empresarial en minutos',
  subtitle:
    'Elige tu perfil y completa solo la informacion necesaria para operar en el marketplace de residuos y subproductos.',
  loginPrompt: 'Ya tienes cuenta?',
  loginCta: 'Inicia sesion',
  createAccountLabel: 'Crear cuenta',
  continueLabel: 'Continuar',
  backLabel: 'Volver'
} as const;

export const ACCOUNT_TYPE_OPTIONS: readonly AccountTypeOption[] = [
  {
    value: AccountType.Company,
    title: 'Company',
    description: 'Para empresas que compran, venden o valorizan residuos a escala.',
    icon: 'building-2'
  },
  {
    value: AccountType.NaturalPerson,
    title: 'Natural person',
    description: 'Para operadores individuales con flujo de registro mas ligero.',
    icon: 'user-round'
  }
];

export const INTENT_OPTIONS: readonly IntentOption[] = [
  {
    value: RegistrationIntent.Sell,
    label: 'I want to sell waste/byproducts',
    helper: 'Publica lotes y conecta con compradores verificados.'
  },
  {
    value: RegistrationIntent.Buy,
    label: 'I want to buy',
    helper: 'Encuentra insumos recuperados para tu operacion.'
  },
  {
    value: RegistrationIntent.Recommendations,
    label: 'I want recommendations',
    helper: 'Recibe sugerencias de valorizacion y nuevos usos.'
  },
  {
    value: RegistrationIntent.Both,
    label: 'I want both',
    helper: 'Opera como comprador y vendedor en un mismo perfil.'
  }
];

export const COMPANY_REGISTER_STEPS: readonly RegisterStepItem[] = [
  {
    index: 0,
    title: 'Company data',
    subtitle: 'Identificacion y contacto legal'
  },
  {
    index: 1,
    title: 'Intent + credentials',
    subtitle: 'Objetivo comercial y acceso seguro'
  }
];

export const REGISTER_VALIDATION_MESSAGES = {
  required: 'Este campo es obligatorio.',
  invalidEmail: 'Ingresa un email valido.',
  passwordMismatch: 'Las contrasenas no coinciden.',
  invalidRuc: 'El RUC debe tener 11 digitos.',
  invalidDocument: 'El documento debe tener entre 8 y 12 digitos.'
} as const;
