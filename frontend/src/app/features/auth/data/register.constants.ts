import { AccountType, AccountTypeOption, IntentOption, RegistrationIntent, RegisterStepItem } from '../domain/register.models';

export const REGISTER_PAGE_COPY = {
  badge: 'Registro de Empresa',
  title: 'Inicia el registro de tu organización',
  subtitle:
    'Inicie la transformación sostenible de su cadena de suministro completando los datos básicos de su empresa.',
  loginPrompt: '¿Ya tiene una cuenta?',
  loginCta: 'Inicie sesión aquí',
  createAccountLabel: 'Finalizar registro',
  continueLabel: 'Siguiente',
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
    title: 'Registro Inicial',
    subtitle: 'Datos básicos y contacto'
  },
  {
    index: 1,
    title: 'Objetivo y Acceso',
    subtitle: 'Propósito y credenciales'
  }
];

export const REGISTER_VALIDATION_MESSAGES = {
  required: 'Este campo es obligatorio.',
  invalidEmail: 'Ingresa un email valido.',
  passwordMismatch: 'Las contrasenas no coinciden.',
  invalidRuc: 'El RUC debe tener 11 digitos.',
  invalidDocument: 'El documento debe tener entre 8 y 12 digitos.',
  invalidPhone: 'Ingresa un telefono valido de 7 a 15 digitos.',
  invalidPostalCode: 'El codigo postal solo debe contener numeros.',
  invalidBusinessName: 'La razon social solo permite letras, numeros y signos comerciales basicos.',
  invalidAddress: 'La direccion contiene caracteres no permitidos.',
  invalidName: 'Solo se permiten letras, espacios y signos de nombre validos.',
  invalidJobTitle: 'El cargo solo permite letras, espacios y guiones.',
  suspiciousContent: 'No se permite HTML, scripts ni contenido sospechoso.',
  notMeaningful: 'Ingresa un valor valido y legible.',
  invalidPassword: 'La contrasena debe tener al menos 8 caracteres, 1 mayuscula y 1 numero.'
} as const;
