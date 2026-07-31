"use server";

import { redirect } from "next/navigation";

import { deckAdminAuthorized } from "@/lib/deck/admin";
import { deckSecret, stripTrackingSuffix } from "@/lib/deck/token";
import { markDeckLinkSent } from "@/lib/notion/deckRequests";

/**
 * "Record in Notion" on /deck-admin: writes the link just minted onto the
 * request's row (Deck link sent, Link expires, Status → "Link sent") so the
 * founders never retype it.
 *
 * The DECK_SECRET is re-checked here — a server action is a public endpoint,
 * so the hidden `key` field is treated exactly like the one in the URL and an
 * unauthorized call is bounced to the home page rather than told it guessed a
 * real route.
 */
export async function markDeckLinkSentAction(formData: FormData): Promise<void> {
  const field = (name: string): string => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  const key = stripTrackingSuffix(field("key"));
  if (!deckAdminAuthorized(key, deckSecret())) redirect("/");

  const row = field("row");
  const url = field("url");
  const rawExpiry = field("expiresAt");
  const expiresAtMs = rawExpiry === "" ? null : Number(rawExpiry);

  const result = await markDeckLinkSent(row, {
    url,
    expiresAtMs: expiresAtMs !== null && Number.isFinite(expiresAtMs) ? expiresAtMs : null,
  });

  if (result.status === "failed") {
    console.error("deck-admin: failed to record the link in Notion", result.reason);
  }

  // Back to a mint-free view: re-rendering with the original duration params
  // would mint a second, different token and contradict what was just saved.
  const params = new URLSearchParams({ key, row, saved: result.status });
  redirect(`/deck-admin?${params.toString()}`);
}
