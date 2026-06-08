"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check Your Email">
        <div className={styles.success}>
          <p>
            If an account with that email exists, we&apos;ve sent a password reset link.
          </p>
          <Link href="/auth" className={styles.backLink}>
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot Password">
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input
          label="Enter Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error}
          required
          autoFocus
        />
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
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
