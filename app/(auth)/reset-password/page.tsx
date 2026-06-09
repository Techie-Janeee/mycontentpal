"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const passwordRequirements = [
    { key: "uppercase", label: "Must contain an uppercase letter", check: (v: string) => /[A-Z]/.test(v) },
    { key: "lowercase", label: "Must contain a lowercase letter", check: (v: string) => /[a-z]/.test(v) },
    { key: "number", label: "Must contain a number", check: (v: string) => /[0-9]/.test(v) },
    { key: "minLength", label: "Must be at least 8 characters", check: (v: string) => v.length >= 8 },
  ] as const;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link");
      return;
    }

    if (!password.trim()) {
      setError("Password cannot be empty");
      return;
    }

    const unmet = passwordRequirements.find((r) => !r.check(password));
    if (unmet) {
      setError(unmet.label);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        router.push("/auth");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Reset Password">
        <div className={styles.error}>
          <p>Invalid or missing reset token.</p>
          <Link href="/forgot-password" className={styles.backLink}>
            Request a new reset link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
          onFocus={() => { if (error) setError(""); setPasswordFocus(true); }}
          onBlur={() => setPasswordFocus(false)}
          error={error}
          required
          autoFocus
        />
        {password && !isLoading && passwordRequirements.find((r) => !r.check(password)) && (
          <div style={{ fontFamily: "var(--font-body-small-font-family)", fontSize: "var(--font-body-small-font-size)", color: "var(--color-onSurfaceVariant)", marginTop: -16 }}>
            {passwordRequirements.find((r) => !r.check(password))?.label}
          </div>
        )}
        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(""); }}
          required
        />
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
        <div className={styles.footer}>
          <Link href="/auth" className={styles.backLink}>
            Back to login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
