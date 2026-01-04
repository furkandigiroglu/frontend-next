export type AuthFormText = {
  title: string;
  description: string;
  emailLabel: string;
  passwordLabel: string;
  rememberLabel: string;
  forgotLabel: string;
  forgotHref: string;
  submitLabel: string;
  switchLabel: string;
  switchActionLabel: string;
  switchHref: string;
  supportLabel: string;
  highlights: string[];
};

export type AuthContent = {
  login: AuthFormText;
};
