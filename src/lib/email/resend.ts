import { Resend } from "resend";

type EmailSendResult = {
  skipped: boolean;
};

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendTransactionalEmail(
  input: SendEmailInput
): Promise<EmailSendResult> {
  const resend = getResendClient();
  if (!resend) {
    return { skipped: true };
  }

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });

  return { skipped: false };
}
