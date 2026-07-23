// utils/scraper.ts
// DOM scraping utilities for extracting data from the live Codeforces page.

import { normalizeProblemKey } from './urlHelpers';

/**
 * Fetches the current user's Codeforces friends list by scraping the
 * authenticated /friends page. Filters out the current user's own handle.
 *
 * @param currentHandle - Optional handle to exclude from results.
 * @returns A deduplicated array of friend handles.
 */
export async function fetchFriendsList(currentHandle?: string): Promise<string[]> {
  try {
    const res = await fetch('https://codeforces.com/friends', { credentials: 'include' });
    if (!res.ok || res.url.includes('/enter')) {
      throw new Error('Not logged in or blocked');
    }
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const main = doc.querySelector('#pageContent') || doc;

    let table = main.querySelector('table.datatable');
    if (!table) {
      table =
        Array.from(main.querySelectorAll('table')).find((t) =>
          t.querySelector('tbody a[href^="/profile/"]')
        ) || null;
    }
    if (!table) return [];

    const anchors = table.querySelectorAll('tbody a[href^="/profile/"]');
    let handles = Array.from(anchors)
      .map((a) => (a.textContent || '').trim())
      .filter((h) => /^[A-Za-z0-9._-]{2,32}$/.test(h));

    handles = [...new Set(handles)];
    if (currentHandle) handles = handles.filter((h) => h !== currentHandle);

    return handles;
  } catch (e) {
    console.warn('fetchFriendsList error:', e);
    return [];
  }
}

/**
 * Extracts problem data (title, url, rating, tags) from the current Codeforces DOM.
 * Clones the title element to strip injected portal buttons before reading text.
 */
export const extractProblemData = () => {
  const titleEl = document.querySelector(".problem-statement .title, .problem-title, #problem-statement .title, h1.title");
  if (!titleEl) return null;

  // Clone node and strip out injected action buttons, scripts, or styles to get clean problem title text
  const clone = titleEl.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.problem-actions, button, script, style, svg').forEach(el => el.remove());
  const title = clone.textContent?.trim() || '';

  if (!title) return null;
  const url = window.location.href;

  // Collect tags and rating
  const tagsArr = Array.from(document.querySelectorAll('.tag-box'), el => el.textContent?.trim() || '');
  const starTag = tagsArr.find(t => t.startsWith('*'));
  const rating = starTag ? parseInt(starTag.slice(1), 10) : 0;

  return {
    title,
    url,
    rating,
    tags: tagsArr,
    savedAt: new Date().toISOString(),
    solved: false,
    notes: ''
  };
};

/**
 * Extracts "123-A" from the current page URL.
 * Delegates to the shared normalizeProblemKey utility.
 */
export const getCurrentProblemKey = (): string | null => {
  return normalizeProblemKey(location.href);
};

/**
 * Grabs the username of the logged-in user directly from the Codeforces header.
 */
export const getUsername = () => {
  return document.querySelector('#header a[href^="/profile/"]')?.textContent?.trim() || '';
};