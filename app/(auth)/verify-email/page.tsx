"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/Button";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <AuthLayout title="Email Verification">
      {status === "verifying" && <p style={{ textAlign: "center", color: "var(--color-onSurfaceVariant)" }}>Verifying your email...</p>}

      {status === "success" && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--color-onSurfaceVariant)", marginBottom: 24 }}>
            {message}
          </p>
          <Button fullWidth onClick={() => router.push("/auth")}>
            Log in
          </Button>
        </div>
      )}

      {status === "error" && (
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--color-error)", marginBottom: 24 }}>{message}</p>
          <Link href="/auth" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>
            Back to login
          </Link>
        </div>
      )}
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
