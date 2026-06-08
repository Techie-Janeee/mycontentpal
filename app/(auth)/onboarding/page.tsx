"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "./page.module.css";

const steps = [
  {
    title: "Welcome to MyContentPal",
    description:
      "Your AI-powered content strategy assistant for better ideas, clearer direction, and more consistent content.",
  },
  {
    title: "Stop Guessing What to Post",
    description:
      "Get content ideas, strategy recommendations, and actionable insights tailored to your niche and platform.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      router.push("/dashboard");
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.logo}>
        MyContentPal
      </Link>

      <div className={styles.progress}>
        <button
          type="button"
          onClick={() => setStep(0)}
          className={`${styles.circle} ${step >= 0 ? styles.circleActive : ""}`}
        >
          1
        </button>
        <div className={styles.line}>
          <div className={`${styles.lineFill} ${step >= 1 ? styles.lineFilled : ""}`} />
        </div>
        <button
          type="button"
          onClick={() => setStep(1)}
          className={`${styles.circle} ${step >= 1 ? styles.circleActive : ""}`}
        >
          2
        </button>
      </div>

      <h1 className={styles.title}>{steps[step].title}</h1>
      <p className={styles.description}>{steps[step].description}</p>

      <div className={styles.actions}>
        <Button fullWidth onClick={handleNext}>
          {isLastStep ? "Go To Dashboard" : "Next"}
        </Button>
      </div>
      {step === 0 ? (
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className={`${styles.navLink} ${styles.navLinkLight}`}
        >
          Skip
        </button>
      ) : (
        <button
          type="button"
          onClick={handleBack}
          className={`${styles.navLink} ${styles.navLinkLight}`}
        >
          Back
        </button>
      )}
    </div>
  );
}
