"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { SendHorizontal } from "lucide-react";
import type { GenerateOutput } from "@/types";
import styles from "./ChatPanel.module.css";

type Message = { role: "user" | "assistant"; content: string };

type ChatPanelProps = {
  outputData: GenerateOutput | null;
  niche: string;
  platform: string;
  showChatMobile: boolean;
  onShowChatMobileChange: (v: boolean) => void;
  pendingMessage: string | null;
  onPendingMessageConsumed: () => void;
};

export function ChatPanel({ outputData, niche, platform, showChatMobile, onShowChatMobileChange, pendingMessage, onPendingMessageConsumed }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hey! 👋 I'm your Content Pal. Once you generate your insights, I can help you write captions, find hashtags, explain any result, or just brainstorm with you. What's on your mind?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isChatLoading) return;

      const userMsg: Message = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setChatInput("");
      setIsChatLoading(true);
      setChatError("");

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text.trim(),
            history: [...messages, userMsg],
            results: outputData?.result,
            niche,
            platform,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setChatError(data.error || "Failed to get reply");
        } else {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: data.reply },
          ]);
        }
      } catch {
        setChatError("Failed to get reply");
      } finally {
        setIsChatLoading(false);
      }
    },
    [messages, outputData, niche, platform, isChatLoading]
  );

  const handleSend = () => sendMessage(chatInput);

  useEffect(() => {
    if (pendingMessage) {
      sendMessage(pendingMessage);
      onPendingMessageConsumed();
    }
  }, [pendingMessage, sendMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={`${styles.right} ${showChatMobile ? styles.rightVisible : ""}`}>
      <div className={styles.chatPanel}>
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderTop}>
            <span className={styles.onlineDot} />
            <span className={styles.chatName}>Content Pal</span>
            <button
              type="button"
              className={styles.closeChatBtn}
              onClick={() => onShowChatMobileChange(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <span className={styles.chatSub}>Always here to help</span>
        </div>

        <div className={styles.chatMessages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.bubble} ${msg.role === "user" ? styles.userBubble : styles.assistantBubble}`}
            >
              {msg.content}
            </div>
          ))}
          {isChatLoading && (
            <div className={`${styles.bubble} ${styles.assistantBubble}`}>
              <span className={styles.typing}>Thinking...</span>
            </div>
          )}
          {chatError && <p className={styles.chatError}>{chatError}</p>}
          <div ref={chatEndRef} />
        </div>

        <div className={styles.chatInputRow}>
          <input
            className={styles.chatInput}
            placeholder="Ask anything about your content..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={isChatLoading || !chatInput.trim()}
          >
            {isChatLoading ? "..." : <SendHorizontal size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
