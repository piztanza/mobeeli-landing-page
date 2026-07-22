"use client";

import { useState } from "react";

/**
 * Clipboard copy button for the founder-only /deck-admin output (F-016).
 * Labels arrive as props so the server page resolves them from the i18n maps.
 */
export default function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the founder can still select the link text */
    }
  };

  return (
    <button type="button" className="mb-da-copy" onClick={() => void copy()}>
      {copied ? copiedLabel : label}
    </button>
  );
}
