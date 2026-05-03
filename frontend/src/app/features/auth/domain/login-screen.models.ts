export enum AuthProvider {
  EmailPassword = 'email_password',
  Google = 'google'
}

export interface LoginPayload {
  readonly email: string;
  readonly password: string;
  readonly rememberMe: boolean;
}

export interface SocialAuthOption {
  readonly provider: AuthProvider;
  readonly label: string;
  readonly enabled: boolean;
}

export interface LoginFeatureItem {
  readonly id: 'match' | 'pricing' | 'logistics';
  readonly title: string;
  readonly description: string;
  readonly icon: 'recycle' | 'chart-no-axes-column-increasing' | 'truck';
}

export interface LoginScreenCopy {
  readonly badge: string;
  readonly headline: string;
  readonly supportingText: string;
  readonly forgotPasswordLabel: string;
  readonly createAccountLabel: string;
  readonly createAccountCta: string;
  readonly signInLabel: string;
  readonly emailLabel: string;
  readonly passwordLabel: string;
}
