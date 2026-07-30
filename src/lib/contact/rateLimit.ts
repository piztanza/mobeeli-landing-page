/**
 * Per-IP fixed-window rate limiter for POST /api/contact (R30b): 5 requests
 * per hour per IP. Same in-memory approach as the deck-request limiter —
 * deliberately not shared so the endpoints keep independent windows.
 */

const WINDOW_MS = 3_600_000;
const MAX_PER_WINDOW = 5;

interface Window {
  count: number;
  startedAt: number;
}

const windows = new Map<string, Window>();

/** Returns true when the request is allowed; false when the IP is over the limit. */
export function checkContactRateLimit(ip: string, now = Date.now()): boolean {
  const current = windows.get(ip);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    if (windows.size > 10_000) {
      for (const [key, value] of windows) {
        if (now - value.startedAt >= WINDOW_MS) windows.delete(key);
      }
    }
    windows.set(ip, { count: 1, startedAt: now });
    return true;
  }
  current.count += 1;
  return current.count <= MAX_PER_WINDOW;
}

/** Test-only: clears all rate-limit state. */
export function resetContactRateLimit(): void {
  windows.clear();
}
