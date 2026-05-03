import { AccountType, AccountTypeOption, IntentOption, RegistrationIntent, RegisterStepItem } from '../domain/register.models';

export const REGISTER_PAGE_COPY = {
  badge: 'Registro de Empresa',
  title: 'Inicia el registro de tu organización',
  subtitle:
    'Inicia la transformación sostenible de tu cadena de suministro completando los datos básicos de tu empresa.',
  loginPrompt: '¿Ya tienes una cuenta?',
  loginCta: 'Inicia sesión aquí',
  createAccountLabel: 'Finalizar registro',
  continueLabel: 'Siguiente',
  backLabel: 'Volver'
} as const;

export const ACCOUNT_TYPE_OPTIONS: readonly AccountTypeOption[] = [
  {
    value: AccountType.Company,
    title: 'Empresa',
    description: 'Para empresas que compran, venden o valorizan residuos a escala.',
    icon: 'building-2'
  },
  {
    value: AccountType.NaturalPerson,
    title: 'Persona natural',
    description: 'Para operadores individuales con flujo de registro más ligero.',
    icon: 'user-round'
  }
];

export const INTENT_OPTIONS: readonly IntentOption[] = [
  {
    value: RegistrationIntent.Sell,
    label: 'Quiero vender residuos/subproductos',
    helper: 'Publica lotes y conecta con compradores verificados.'
  },
  {
    value: RegistrationIntent.Buy,
    label: 'Quiero comprar',
    helper: 'Encuentra insumos recuperados para tu operación.'
  },
  {
    value: RegistrationIntent.Recommendations,
    label: 'Quiero recomendaciones',
    helper: 'Recibe sugerencias de valorización y nuevos usos.'
  },
  {
    value: RegistrationIntent.Both,
    label: 'Quiero ambos',
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
  invalidEmail: 'Ingresa un correo electrónico válido.',
  passwordMismatch: 'Las contraseñas no coinciden.',
  invalidRuc: 'El RUC debe tener 12 dígitos.',
  invalidDocument: 'El documento debe tener entre 8 y 12 digitos.',
  invalidPhone: 'Ingresa un teléfono válido de 9 dígitos.',
  invalidPostalCode: 'El código postal debe tener entre 5 y 6 dígitos.',
  invalidBusinessName: 'La razon social solo permite letras, numeros y signos comerciales basicos.',
  invalidAddress: 'La direccion contiene caracteres no permitidos.',
  invalidName: 'Solo se permiten letras, espacios y signos de nombre validos.',
  invalidJobTitle: 'El cargo solo permite letras, espacios y guiones.',
  suspiciousContent: 'No se permite HTML, scripts ni contenido sospechoso.',
  notMeaningful: 'Ingresa un valor valido y legible.',
  invalidPassword: 'La contraseña debe tener al menos 8 caracteres, 1 mayúscula y 1 número.'
} as const;
