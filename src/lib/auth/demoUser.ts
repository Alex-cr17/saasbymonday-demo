export function getDemoUserEmail(): string {
  return (process.env.DEMO_USER_EMAIL ?? "").trim().toLowerCase();
}

export function isDemoUserEmail(email: string | null | undefined): boolean {
  const demoEmail = getDemoUserEmail();
  if (!demoEmail || !email) return false;
  return email.toLowerCase() === demoEmail;
}
