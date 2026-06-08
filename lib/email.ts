import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const FROM_EMAIL = "MyContentPal <noreply@mycontentpal.com>";

export function generateEmailToken(): { token: string; expiry: Date } {
  return {
    token: crypto.randomBytes(32).toString("hex"),
    expiry: new Date(Date.now() + 60 * 60 * 1000),
  };
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyLink = `${baseUrl}/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your MyContentPal email",
    html: [
      `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">`,
      `  <h1 style="font-size: 20px; margin-bottom: 16px;">MyContentPal</h1>`,
      `  <p style="color: #555; line-height: 1.6;">`,
      `    Thanks for creating an account! Click the link below to verify your email address.`,
      `  </p>`,
      `  <a href="${verifyLink}"`,
      `     style="display: inline-block; margin: 24px 0; padding: 12px 24px;`,
      `            background-color: #f97316; color: #fff; text-decoration: none;`,
      `            border-radius: 8px; font-weight: 600;">`,
      `    Verify Email`,
      `  </a>`,
      `  <p style="color: #999; font-size: 14px;">`,
      `    This link expires in 1 hour. If you didn't create an account, you can ignore this email.`,
      `  </p>`,
      `</div>`,
    ].join("\n"),
  });

  if (error) {
    console.error("[EMAIL ERROR]", error);
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your MyContentPal password",
    html: [
      `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">`,
      `  <h1 style="font-size: 20px; margin-bottom: 16px;">MyContentPal</h1>`,
      `  <p style="color: #555; line-height: 1.6;">`,
      `    We received a request to reset your password. Click the link below to choose a new one.`,
      `  </p>`,
      `  <a href="${resetLink}"`,
      `     style="display: inline-block; margin: 24px 0; padding: 12px 24px;`,
      `            background-color: #f97316; color: #fff; text-decoration: none;`,
      `            border-radius: 8px; font-weight: 600;">`,
      `    Reset Password`,
      `  </a>`,
      `  <p style="color: #999; font-size: 14px;">`,
      `    This link expires in 1 hour. If you didn't request this, you can ignore this email.`,
      `  </p>`,
      `</div>`,
    ].join("\n"),
  });

  if (error) {
    console.error("[EMAIL ERROR]", error);
  }
}
