// src/utils/streak.ts
import { fetchUserStatus } from './api';

export interface StreakInfo {
    currentStreak: number;
    longestStreak: number;
    lastSolvedDate: string | null;
}

const STREAK_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

/**
 * Calculates current and longest streak from Codeforces submission history.
 */
export function calculateStreak(submissions: any[]): StreakInfo {
    const solvedSubmissions = (submissions || []).filter(sub => sub && sub.verdict === 'OK');
    
    if (solvedSubmissions.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null };
    }

    // Convert creation timestamps to YYYY-MM-DD dates in local time
    const dateSet = new Set<string>();
    for (const sub of solvedSubmissions) {
        if (sub.creationTimeSeconds) {
            const dateStr = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
            dateSet.add(dateStr);
        }
    }

    const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) {
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null };
    }

    // Get today and yesterday in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Determine current streak
    let currentStreak = 0;
    let checkDate = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);

    if (checkDate) {
        let cursor = new Date(checkDate);
        while (true) {
            const cursorStr = cursor.toISOString().split('T')[0];
            if (dateSet.has(cursorStr)) {
                currentStreak++;
                cursor.setDate(cursor.getDate() - 1);
            } else {
                break;
            }
        }
    }

    // Determine longest streak ever
    let longestStreak = 0;
    let tempStreak = 0;
    
    // Sort dates ascending for forward streak calculation
    const ascDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
    let prevDate: Date | null = null;

    for (const dStr of ascDates) {
        const currDate = new Date(dStr);
        if (!prevDate) {
            tempStreak = 1;
        } else {
            const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
            if (diffDays === 1) {
                tempStreak++;
            } else if (diffDays > 1) {
                tempStreak = 1;
            }
        }
        prevDate = currDate;
        if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
        }
    }

    return {
        currentStreak,
        longestStreak: Math.max(currentStreak, longestStreak),
        lastSolvedDate: dates[0] || null
    };
}

/**
 * Fetches streak information for a user with local caching.
 */
export async function getUserStreak(handle: string): Promise<StreakInfo> {
    if (!handle) {
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null };
    }

    const cacheKey = `streak_${handle.toLowerCase()}`;
    
    try {
        const data = await chrome.storage.local.get(cacheKey);
        const cached = (data[cacheKey] as { timestamp?: number; info?: StreakInfo }) || undefined;
        if (cached && cached.timestamp && Date.now() - cached.timestamp < STREAK_CACHE_DURATION && cached.info) {
            return cached.info;
        }
    } catch (e) {
        console.warn('Error reading streak cache:', e);
    }

    try {
        const submissions = await fetchUserStatus(handle, 1000);
        const info = calculateStreak(submissions);

        try {
            await chrome.storage.local.set({
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
        return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null };
    }
}
