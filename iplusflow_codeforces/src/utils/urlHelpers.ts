// utils/urlHelpers.ts
// Pure URL utility functions — no side effects, no DOM, no network.

/**
 * Parses a Codeforces problem URL and returns a normalized key
 * in the format "<contestId>-<problemIndex>" (e.g. "1234-A").
 *
 * Supports contest, gym, problemset, and edu URLs.
 *
 * @param url - The full Codeforces problem URL.
 * @returns The normalized key, or null if the URL is not a recognized problem URL.
 */
export function normalizeProblemKey(url: string | undefined): string | null {
  if (typeof url !== 'string') return null;
  const m =
    url.match(/\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/) ||
    url.match(/\/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/) ||
    url.match(/\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/) ||
    url.match(/\/edu\/[^/]+\/practice\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `${m[1]}-${m[2]}`;
}
