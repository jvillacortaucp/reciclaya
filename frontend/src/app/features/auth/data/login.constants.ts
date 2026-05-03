import { AuthProvider, LoginFeatureItem, LoginScreenCopy, SocialAuthOption } from '../domain/login-screen.models';

export const LOGIN_SCREEN_COPY: LoginScreenCopy = {
  badge: 'Marketplace circular B2B y B2C',
  headline: 'Transforma residuos en oportunidades de negocio confiables',
  supportingText:
    'Publica lotes, compra subproductos y descubre nuevos usos para residuos agroindustriales con trazabilidad y velocidad comercial.',
  forgotPasswordLabel: '¿Olvidaste tu contraseña?',
  createAccountLabel: '¿Aún no tienes cuenta?',
  createAccountCta: 'Crear cuenta',
  signInLabel: 'Iniciar sesión',
  emailLabel: 'Correo electrónico',
  passwordLabel: 'Contraseña'
};

export const LOGIN_FEATURE_ITEMS: readonly LoginFeatureItem[] = [
  {
    id: 'match',
    icon: 'recycle',
    title: 'Match inteligente de oferta y demanda',
    description: 'Conecta residuos valorizables con compradores en minutos.'
  },
  {
    id: 'pricing',
    icon: 'chart-no-axes-column-increasing',
    title: 'Visibilidad de precios y volumen',
    description: 'Toma decisiones con datos de mercado en tiempo real.'
  },
  {
    id: 'logistics',
    icon: 'truck',
    title: 'Coordinacion logistica simplificada',
    description: 'Gestiona retiro, entrega y trazabilidad desde un solo panel.'
  }
];

export const SOCIAL_AUTH_OPTIONS: readonly SocialAuthOption[] = [
  {
    provider: AuthProvider.Google,
    label: 'Continuar con Google',
    enabled: true
  }
];

export const LOGIN_VALIDATION_MESSAGES = {
  requiredEmail: 'El correo electrónico es obligatorio.',
  invalidEmail: 'Ingresa un correo electrónico válido.',
  requiredPassword: 'La contraseña es obligatoria.',
  invalidCredentials: 'Las credenciales no coinciden con una cuenta activa.',
  socialDisabled: 'El acceso social no esta disponible temporalmente.'
} as const;
