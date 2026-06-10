"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

type Mode = "login" | "signup";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = (searchParams.get("mode") as Mode) || "login";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [signedUpEmail, setSignedUpEmail] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [notVerifiedEmail, setNotVerifiedEmail] = useState("");
  const [passwordFocus, setPasswordFocus] = useState(false);

  const passwordRequirements = [
    { key: "uppercase", label: "Must contain an uppercase letter", check: (v: string) => /[A-Z]/.test(v) },
    { key: "lowercase", label: "Must contain a lowercase letter", check: (v: string) => /[a-z]/.test(v) },
    { key: "number", label: "Must contain a number", check: (v: string) => /[0-9]/.test(v) },
    { key: "minLength", label: "Must be at least 8 characters", check: (v: string) => v.length >= 8 },
  ] as const;

  const nextRequirement = passwordRequirements.find((r) => !r.check(password));

  const isLogin = mode === "login";

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Email cannot be empty";
    if (!password.trim()) errors.password = "Password cannot be empty";
    if (!isLogin && !confirmPassword.trim()) errors.confirmPassword = "Confirm password cannot be empty";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const unmet = passwordRequirements.find((r) => !r.check(password));
      if (unmet) {
        setError(unmet.label);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });

        if (res?.error === "Email not verified") {
          setError("Please verify your email before logging in.");
          setNotVerifiedEmail(email);
          setIsLoading(false);
        } else if (res?.error) {
          setError("Invalid email or password");
          setIsLoading(false);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong");
          setIsLoading(false);
          return;
        }

        setSignedUpEmail(email);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notVerifiedEmail, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSignedUpEmail(notVerifiedEmail);
      } else {
        setError(data.error || "Failed to resend");
      }
    } catch {
      setError("Something went wrong");
    }
    setIsLoading(false);
  };

  const switchMode = () => {
    setMode(isLogin ? "signup" : "login");
    setError("");
    setNotVerifiedEmail("");
  };

  if (signedUpEmail) {
    return (
      <AuthLayout title="Check Your Email">
        <div style={{ textAlign: "center", lineHeight: 1.6 }}>
          <p style={{ color: "var(--color-onSurfaceVariant)", marginBottom: 8 }}>
            Account created! We sent a verification link to:
          </p>
          <p style={{ fontWeight: 600, marginBottom: 24 }}>{signedUpEmail}</p>
          <p style={{ color: "var(--color-onSurfaceVariant)", fontSize: 14 }}>
            Click the link in the email to activate your account, then log in.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={isLogin ? "Welcome Back" : "Create Account"}
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <Input
          label="Enter Email"
          type="email"
          value={email}
          onChange={(e) => {
            const value = e.target.value;
            setEmail(value);
            if (value && !isValidEmail(value)) {
              setFieldErrors((p) => ({ ...p, email: "Enter a valid email address" }));
            } else {
              setFieldErrors((p) => ({ ...p, email: "" }));
            }
          }}
          onFocus={() => setError("")}
          onBlur={() => {
            if (!email.trim()) setFieldErrors((p) => ({ ...p, email: "This field cannot be empty" }));
          }}
          error={fieldErrors.email}
          required
          autoFocus
        />
        <Input
          label={isLogin ? "Enter Password" : "Choose Password"}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: "" }));
          }}
          onFocus={() => { setError(""); setPasswordFocus(true); }}
          onBlur={() => {
            setPasswordFocus(false);
            if (!password.trim()) setFieldErrors((p) => ({ ...p, password: "This field cannot be empty" }));
          }}
          error={fieldErrors.password}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={styles.eyeButton}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          }
          required
        />
        {isLogin && (
          <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot password?
          </Link>
        )}
        {!isLogin && (passwordFocus || password) && nextRequirement && (
          <div className={styles.requirements}>
            <span className={styles.requirement}>{nextRequirement.label}</span>
          </div>
        )}
        {!isLogin && (
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: "" }));
            }}
            onFocus={() => setError("")}
            onBlur={() => {
              if (!confirmPassword.trim()) setFieldErrors((p) => ({ ...p, confirmPassword: "This field cannot be empty" }));
            }}
            error={fieldErrors.confirmPassword}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                className={styles.eyeButton}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            }
            required
          />
        )}
        {error && (
          <div className={styles.error}>
            {error}
            {notVerifiedEmail && (
              <button
                type="button"
                onClick={resendVerification}
                className={styles.resendBtn}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend verification email"}
              </button>
            )}
          </div>
        )}
        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading
            ? isLogin
              ? "Logging in..."
              : "Creating account..."
            : isLogin
              ? "Log in"
              : "Sign up"}
        </Button>
        <div className={styles.footer}>
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={switchMode} className={styles.link}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={switchMode} className={styles.link}>
                Log in
              </button>
            </>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
