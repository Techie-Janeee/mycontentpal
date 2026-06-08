"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ChevronDown } from "lucide-react";
import type { Action } from "@/types";
import styles from "./GenerationForm.module.css";

const actions: { id: Action; title: string; desc: string }[] = [
  { id: "content-audit", title: "Content Audit", desc: "Understand what's working and what's not" },
  { id: "idea-generation", title: "Content Ideas", desc: "Get tailored post ideas for your niche" },
  { id: "strategy-recommendation", title: "Strategy", desc: "Get a clear action plan to grow faster" },
  { id: "competitor-insights", title: "Competitor Insights", desc: "See what's working for top creators in your space" },
];

type GenerationFormProps = {
  niche: string;
  onNicheChange: (v: string) => void;
  platform: "TikTok" | "Instagram";
  onPlatformChange: (v: "TikTok" | "Instagram") => void;
  description: string;
  onDescriptionChange: (v: string) => void;
  action: Action;
  onActionChange: (v: Action) => void;
  isGenerating: boolean;
  error: string;
  onSubmit: () => void;
  suggestionChips: string[];
  onChipClick: (chip: string) => void;
};

export function GenerationForm({
  niche, onNicheChange,
  platform, onPlatformChange,
  description, onDescriptionChange,
  action, onActionChange,
  isGenerating, error, onSubmit,
  suggestionChips, onChipClick,
}: GenerationFormProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.formCard}>
      <div className={styles.row}>
        <div className={styles.rowField}>
          <Input
            label="Your niche"
            placeholder="e.g. fitness for busy moms, cooking on a budget, fashion tips for men"
            value={niche}
            onChange={(e) => onNicheChange(e.target.value)}
          />
        </div>
        <div className={styles.rowField}>
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Platform</label>
            <div className={styles.dropdown} ref={dropdownRef}>
              <button
                type="button"
                className={styles.dropdownTrigger}
                onClick={() => setDropdownOpen((o) => !o)}
              >
                {platform}
                <ChevronDown size={16} className={styles.dropdownArrow} />
              </button>
              {dropdownOpen && (
                <div className={styles.dropdownMenu}>
                  {(["Instagram", "TikTok"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`${styles.dropdownItem} ${platform === p ? styles.dropdownItemActive : ""}`}
                      onClick={() => { onPlatformChange(p); setDropdownOpen(false); }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Describe your page</label>
        <textarea
          className={styles.textarea}
          placeholder="Paste your bio, describe what you post, and share 1-2 recent caption examples. The more detail you give, the better your results."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>What do you need?</label>
        <div className={styles.actionGrid}>
          {actions.map((a) => (
            <button
              key={a.id}
              type="button"
              className={`${styles.actionCard} ${action === a.id ? styles.actionActive : ""}`}
              onClick={() => onActionChange(a.id)}
            >
              <span className={styles.actionTitle}>{a.title}</span>
              <span className={styles.actionDesc}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <Button fullWidth onClick={onSubmit} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate my insights ✦"}
      </Button>

      {suggestionChips.length > 0 && (
        <div className={styles.prompts}>
          {suggestionChips.map((chip) => (
            <button
              key={chip}
              type="button"
              className={styles.chip}
              onClick={() => onChipClick(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
