import nodemailer from "nodemailer";
import crypto from "crypto";

function createTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || "noreply@mycontentpal.com";

export function generateEmailToken(): { token: string; expiry: Date } {
  return {
    token: crypto.randomBytes(32).toString("hex"),
    expiry: new Date(Date.now() + 60 * 60 * 1000),
  };
}

function buildEmailHtml(body: string, link: string, label: string) {
  return [
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">`,
    `  <h1 style="font-size: 20px; margin-bottom: 16px;">MyContentPal</h1>`,
    `  <p style="color: #555; line-height: 1.6;">${body}</p>`,
    `  <a href="${link}"`,
    `     style="display: inline-block; margin: 24px 0; padding: 12px 24px;`,
    `            background-color: #f97316; color: #fff; text-decoration: none;`,
    `            border-radius: 8px; font-weight: 600;">${label}</a>`,
    `  <p style="color: #999; font-size: 14px;">This link expires in 1 hour.</p>`,
    `</div>`,
  ].join("\n");
}

async function sendEmail(to: string, subject: string, html: string) {
  const transporter = createTransporter();
  if (!transporter) {
    throw new Error("SMTP not configured");
  }
  const info = await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
  console.log("[EMAIL] Sent:", info.messageId);
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/verify-email?token=${token}`;
  await sendEmail(
    email,
    "Verify your MyContentPal email",
    buildEmailHtml(
      "Thanks for creating an account! Click the link below to verify your email address.",
      link,
      "Verify Email"
    )
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/reset-password?token=${token}`;
  await sendEmail(
    email,
    "Reset your MyContentPal password",
    buildEmailHtml(
      "We received a request to reset your password. Click the link below to choose a new one.",
      link,
      "Reset Password"
    )
  );
}
