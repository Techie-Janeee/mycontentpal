type AuditEvent =
  | "register.attempt"
  | "register.success"
  | "register.failure"
  | "register.resend"
  | "login.success"
  | "login.failure"
  | "forgot-password.request"
  | "reset-password.success"
  | "reset-password.failure"
  | "generate.success"
  | "generate.failure"
  | "chat.error"
  | "chat.daily-limit.exceeded"
  | "rate-limit.exceeded"
  | "csrf.blocked"
  | "body-too-large";

export function audit(event: AuditEvent, meta?: Record<string, unknown>) {
  const entry = JSON.stringify({
    ts: new Date().toISOString(),
    event,
    ...meta,
  });

  if (
    event.endsWith(".failure") ||
    event === "rate-limit.exceeded" ||
    event === "csrf.blocked" ||
    event === "body-too-large" ||
    event === "chat.error"
  ) {
    console.warn("[AUDIT]", entry);
  } else {
    console.log("[AUDIT]", entry);
  }
}
