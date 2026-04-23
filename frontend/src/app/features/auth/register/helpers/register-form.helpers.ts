export function hasPasswordMismatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && confirmPassword.length > 0 && password !== confirmPassword;
}
