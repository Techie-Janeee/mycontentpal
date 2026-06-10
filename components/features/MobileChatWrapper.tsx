"use client";

import { useState, useEffect } from "react";
import { ChatPanel } from "@/components/features/ChatPanel";

export function MobileChatWrapper() {
  const [showChatMobile, setShowChatMobile] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setShowChatMobile(true);
    window.addEventListener("open-chat", handler);
    return () => window.removeEventListener("open-chat", handler);
  }, []);

  return (
    <ChatPanel
      outputData={null}
      niche=""
      platform="Instagram"
      showChatMobile={showChatMobile}
      onShowChatMobileChange={setShowChatMobile}
      pendingMessage={pendingMessage}
      onPendingMessageConsumed={() => setPendingMessage(null)}
    />
  );
}
