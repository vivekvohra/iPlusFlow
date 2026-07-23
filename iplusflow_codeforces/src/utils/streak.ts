// src/utils/streak.ts
import { fetchUserStatus } from './api';
import type { StreakInfo } from '../types';

// Re-export for backward compatibility
export type { StreakInfo };

const STREAK_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

/**
 * Formats a Date object to a local YYYY-MM-DD date string.
 */
export function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Returns the previous day's local YYYY-MM-DD date string.
 */
export function getPreviousDateString(dateStr: string): string {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    return toLocalDateString(date);
}

/**
 * Calculates current and longest streak from Codeforces submission history using local user time.
 */
export function calculateStreak(submissions: any[]): StreakInfo {
    const solvedSubmissions = (submissions || []).filter(sub => sub && sub.verdict === 'OK');
    
    if (solvedSubmissions.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null, solvedToday: 0 };
    }

    const today = toLocalDateString(new Date());
    const todaySolvedSet = new Set<string>();
    const dateSet = new Set<string>();

    for (const sub of solvedSubmissions) {
        if (sub.creationTimeSeconds) {
            const dateObj = new Date(sub.creationTimeSeconds * 1000);
            const dateStr = toLocalDateString(dateObj);
            dateSet.add(dateStr);

            if (dateStr === today && sub.problem) {
                const key = `${sub.problem.contestId}-${sub.problem.index}`;
                todaySolvedSet.add(key);
            }
        }
    }

    const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null, solvedToday: 0 };
    }

    const yesterday = getPreviousDateString(today);

    // Determine current streak
    let currentStreak = 0;
    let checkDate = dateSet.has(today) ? today : (dateSet.has(yesterday) ? yesterday : null);

    if (checkDate) {
        let cursorStr: string | null = checkDate;
        while (cursorStr && dateSet.has(cursorStr)) {
            currentStreak++;
            cursorStr = getPreviousDateString(cursorStr);
        }
    }

    // Determine longest streak ever
    let longestStreak = 0;
    let tempStreak = 0;
    
    const ascDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
    let prevDateStr: string | null = null;

    for (const dStr of ascDates) {
        if (!prevDateStr) {
            tempStreak = 1;
        } else {
            const expectedNext = getPreviousDateString(dStr);
            if (expectedNext === prevDateStr) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }
        prevDateStr = dStr;
        if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
        }
    }

    return {
        currentStreak,
        longestStreak: Math.max(currentStreak, longestStreak),
        lastSolvedDate: dates[0] || null,
        solvedToday: todaySolvedSet.size
    };
}

/**
 * Clears the streak cache for a given handle.
 */
export async function clearStreakCache(handle: string): Promise<void> {
    if (!handle) return;
    const cacheKey = `streak_${handle.toLowerCase()}`;
    try {
        await chrome?.storage?.local?.remove(cacheKey);
    } catch (e) {
        console.warn('Error clearing streak cache:', e);
    }
}

/**
 * Fetches streak information for a user with local caching.
 * Pass forceRefresh = true to bypass cache.
 */
export async function getUserStreak(handle: string, forceRefresh = false): Promise<StreakInfo> {
    if (!handle) {
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null, solvedToday: 0 };
    }

    const cacheKey = `streak_${handle.toLowerCase()}`;
    
    if (!forceRefresh) {
        try {
            const data = await chrome?.storage?.local?.get(cacheKey);
            const cached = (data?.[cacheKey] as { timestamp?: number; info?: StreakInfo }) || undefined;
            if (cached && cached.timestamp && Date.now() - cached.timestamp < STREAK_CACHE_DURATION && cached.info) {
                return cached.info;
            }
        } catch (e) {
            console.warn('Error reading streak cache:', e);
        }
    }

    try {
        const submissions = await fetchUserStatus(handle, 1000);
        const info = calculateStreak(submissions);

        try {
            await chrome?.storage?.local?.set({
                [cacheKey]: {
                    timestamp: Date.now(),
                    info
                }
            });
        } catch (e) {
            console.warn('Error saving streak cache:', e);
        }

        return info;
    } catch (e) {
        console.warn('Failed to fetch streak info:', e);
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null, solvedToday: 0 };
    }
}
