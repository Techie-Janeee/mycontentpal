"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Action, GenerateOutput } from "@/types";
import { GenerationForm } from "@/components/features/GenerationForm";
import { ResultsArea } from "@/components/features/ResultsArea";
import { ChatPanel } from "@/components/features/ChatPanel";
import { ErrorBoundary } from "@/components/features/ErrorBoundary";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<"TikTok" | "Instagram">("Instagram");
  const [description, setDescription] = useState("");
  const [action, setAction] = useState<Action>("idea-generation");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputData, setOutputData] = useState<GenerateOutput | null>(null);
  const [genError, setGenError] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    const handler = () => setShowChatMobile(true);
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  const handleGenerate = useCallback(async () => {
    setGenError("");
    setIsGenerating(true);
    setOutputData(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche: niche.trim() || "general",
          platform,
          action,
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenError(data.error || "Failed to generate");
        setIsGenerating(false);
        return;
      }

      setOutputData(data as GenerateOutput);
    } catch {
      setGenError("Something went wrong. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [niche, platform, description, action]);

  const suggestionChips = outputData
    ? [
        "Write a caption for one of these ideas",
        "Add hashtags",
        "Give me 3 more ideas",
        "Best time to post",
      ]
    : [];

  if (status === "loading" || !session) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.left}>
        <div className={styles.welcome}>
          <h1 className={styles.greeting}>Hello, Creative</h1>
          <p className={styles.subtext}>
            Tell us about your content and get instant strategy, ideas, and insights.
          </p>
        </div>

        <ErrorBoundary>
          <GenerationForm
            niche={niche}
            onNicheChange={setNiche}
            platform={platform}
            onPlatformChange={setPlatform}
            description={description}
            onDescriptionChange={setDescription}
            action={action}
            onActionChange={setAction}
            isGenerating={isGenerating}
            error={genError}
            onSubmit={handleGenerate}
            suggestionChips={suggestionChips}
            onChipClick={(chip) => {
              setPendingMessage(chip);
              setShowChatMobile(true);
            }}
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <ResultsArea
            isGenerating={isGenerating}
            outputData={outputData}
            onItemClick={(label) => {
              setPendingMessage(`Tell me more about this: ${label}`);
              setShowChatMobile(true);
            }}
          />
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <ChatPanel
          outputData={outputData}
          niche={niche}
          platform={platform}
          showChatMobile={showChatMobile}
          onShowChatMobileChange={setShowChatMobile}
          pendingMessage={pendingMessage}
          onPendingMessageConsumed={() => setPendingMessage(null)}
        />
      </ErrorBoundary>
    </div>
  );
}
