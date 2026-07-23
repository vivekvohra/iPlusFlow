// src/utils/friendsCode.ts
import type { FriendSubmission } from '../types';

// Re-export for backward compatibility
export type { FriendSubmission };

const MAX_FRIENDS = 20;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

let lastApiCallTime = 0;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Throttles API fetches so we don't exceed Codeforces rate limits.
 */
async function rateLimitedFetch(url: string, options?: RequestInit): Promise<Response> {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTime;
    if (timeSinceLastCall < 700) {
        await sleep(700 - timeSinceLastCall);
    }
    lastApiCallTime = Date.now();
    return fetch(url, options);
}

/**
 * Converts a Codeforces language string into a prettyprint class (e.g. lang-cpp).
 */
export function guessLangClass(lang?: string): string {
    if (!lang) return 'lang-cpp';
    const L = lang.toLowerCase();
    if (L.includes('python') || L.includes('pypy')) return 'lang-py';
    if (L.includes('java')) return 'lang-java';
    if (L.includes('kotlin')) return 'lang-kotlin';
    if (L.includes('go')) return 'lang-go';
    if (L.includes('js') || L.includes('node')) return 'lang-js';
    if (L.includes('c++') || L.includes('gcc') || L.includes('clang')) return 'lang-cpp';
    if (L.includes('c#')) return 'lang-cs';
    if (L.includes('rust')) return 'lang-rs';
    return 'lang-cpp';
}

/**
 * Orchestrates finding which friends solved the current problem,
 * checking local cache first, then contest.status (fast), then user.status (fallback).
 */
export const getFriendsWhoSolved = async (
    contestId: string, 
    problemIndex: string, 
    friends: string[]
): Promise<FriendSubmission[]> => {
    const problemKey = `${contestId}-${problemIndex}`;

    // 1. Check local storage cache (valid for 10 minutes)
    try {
        const data = await chrome.storage.local.get('friendCache');
        const friendCache: Record<string, any> = (data.friendCache as Record<string, any>) || {};
        const cacheEntry = friendCache[problemKey];
        if (cacheEntry && cacheEntry.timestamp && Date.now() - cacheEntry.timestamp < CACHE_DURATION) {
            return cacheEntry.results || [];
        }
    } catch (e) {
        console.warn('Error reading friendCache:', e);
    }

    const cidNum = Number(contestId);
    const idxNorm = String(problemIndex).toUpperCase().replace(/\s+/g, '').trim();
    const solvedFriends: FriendSubmission[] = [];

    for (const handle of friends.slice(0, MAX_FRIENDS)) {
        try {
            let accepted: any = null;

            // Check contest.status first (much faster when checking a specific contest)
            try {
                const r1 = await rateLimitedFetch(
                    `https://codeforces.com/api/contest.status?contestId=${cidNum}&handle=${encodeURIComponent(handle)}`
                );
                const d1 = await r1.json();
                if (d1.status === 'OK') {
                    accepted = (d1.result || [])
                        .filter((s: any) => s.verdict === 'OK' &&
                            String(s.problem?.index).toUpperCase().replace(/\s+/g, '').trim() === idxNorm
                        )
                        .sort((a: any, b: any) => b.creationTimeSeconds - a.creationTimeSeconds)[0] || null;
                }
            } catch (err) {
                // Ignore and fall back to user.status
            }

            // Fallback to user.status if contest.status didn't yield an accepted submission
            if (!accepted) {
                const r2 = await rateLimitedFetch(
                    `https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`
                );
                const d2 = await r2.json();
                if (d2.status === 'OK') {
                    accepted = (d2.result || [])
                        .filter((s: any) => s.verdict === 'OK' &&
                            Number(s.problem?.contestId) === cidNum &&
                            String(s.problem?.index).toUpperCase().replace(/\s+/g, '').trim() === idxNorm
                        )
                        .sort((a: any, b: any) => b.creationTimeSeconds - a.creationTimeSeconds)[0] || null;
                }
            }

            if (accepted) {
                solvedFriends.push({
                    handle: handle,
                    submissionId: accepted.id,
                    language: accepted.programmingLanguage || ''
                });
            }
        } catch (error) {
            console.warn(`Failed to check status for friend ${handle}:`, error);
        }

        await sleep(200);
    }

    // Save results to local cache with timestamp
    try {
        const storageData = await chrome.storage.local.get({ friendCache: {} });
        const newCache: Record<string, any> = (storageData.friendCache as Record<string, any>) || {};
        newCache[problemKey] = { timestamp: Date.now(), results: solvedFriends };
        await chrome.storage.local.set({ friendCache: newCache });
    } catch (e) {
        console.warn('Error saving friendCache:', e);
    }

    return solvedFriends;
};

/**
 * Scrapes the actual C++/Java/Python code from a specific submission URL,
 * trying likely URLs based on current page context (contest vs gym vs problemset).
 */
export const fetchSubmissionCodeDetails = async (
    contestId: string, 
    submissionId: number,
    lang?: string
): Promise<{ code: string; subUrl: string; langClass: string }> => {
    const cidNum = Number(contestId);
    const urls: string[] = [];
    const currentUrl = window.location.href;

    if (currentUrl.includes('/gym/')) {
        urls.push(`https://codeforces.com/gym/${cidNum}/submission/${submissionId}`);
        urls.push(`https://codeforces.com/contest/${cidNum}/submission/${submissionId}`);
        urls.push(`https://codeforces.com/problemset/submission/${cidNum}/${submissionId}`);
    } else if (currentUrl.includes('/problemset/')) {
        urls.push(`https://codeforces.com/problemset/submission/${cidNum}/${submissionId}`);
        urls.push(`https://codeforces.com/contest/${cidNum}/submission/${submissionId}`);
        urls.push(`https://codeforces.com/gym/${cidNum}/submission/${submissionId}`);
    } else {
        urls.push(`https://codeforces.com/contest/${cidNum}/submission/${submissionId}`);
        urls.push(`https://codeforces.com/problemset/submission/${cidNum}/${submissionId}`);
        urls.push(`https://codeforces.com/gym/${cidNum}/submission/${submissionId}`);
    }

    let code = '';
    let subUrl = urls[0];

    for (const u of urls) {
        try {
            const subRes = await fetch(u, { credentials: 'include' });
            if (!subRes.ok) continue;

            const html = await subRes.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const pre = doc.querySelector('#program-source-text, pre.program-source, pre.prettyprint, .source-code pre, #pageContent pre');

            if (pre && pre.textContent) {
                code = pre.textContent.trimEnd();
                const canonical =
                    (doc.querySelector('link[rel="canonical"][href*="/submission/"]') as HTMLLinkElement)?.href ||
                    (doc.querySelector('meta[property="og:url"][content*="/submission/"]') as HTMLMetaElement)?.content;
                const picked = canonical ? new URL(canonical, 'https://codeforces.com').toString() : u;
                subUrl = picked.includes('?') ? picked : `${picked}?f0a28=1`;
                break;
            }
        } catch (e) {
            console.warn(`Failed fetching code from ${u}:`, e);
        }
    }

    if (!code) {
        code = "// Error fetching code or submission is private/not found.";
    }

    return {
        code,
        subUrl,
        langClass: guessLangClass(lang)
    };
};