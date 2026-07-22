/**
 * Per-IP fixed-window rate limiter for POST /api/waitlist (F-008).
 * In-memory is sufficient here: the endpoint is a low-volume pre-launch lead
 * form and the limit only needs to stop bursts/scripted spam per instance.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

interface Window {
  count: number;
  startedAt: number;
}

const windows = new Map<string, Window>();

/** Returns true when the request is allowed; false when the IP is over the limit. */
export function checkRateLimit(ip: string, now = Date.now()): boolean {
  const current = windows.get(ip);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    // Opportunistic prune so the map can't grow unbounded across a long process.
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
export function resetRateLimit(): void {
  windows.clear();
}
