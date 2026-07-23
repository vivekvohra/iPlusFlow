// hooks/useSolvedStatus.ts
// Custom hook that checks whether the current problem is solved and fetches streak info.

import { useEffect, useRef, useState } from 'react';
import type { StreakInfo } from '../types';
import { getCurrentProblemKey, getUsername } from '../utils/scraper';
import { fetchUserStatus } from '../utils/api';
import { checkUrlBookmarked, markBookmarkSolved } from '../utils/storage';
import { getUserStreak, calculateStreak } from '../utils/streak';

export function useSolvedStatus(handle: string | null) {
    const [isSolved, setIsSolved] = useState(false);
    const [streakInfo, setStreakInfo] = useState<StreakInfo>({ currentStreak: 0, longestStreak: 0, lastSolvedDate: null });
    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        if (!handle) return;

        getUserStreak(handle).then((info) => {
            if (isMounted.current) {
                setStreakInfo(info);
            }
        });

        const checkSolvedStatus = async () => {
            const problemKey = getCurrentProblemKey();
            const username = getUsername() || handle;
            if (!username) return;

            const currentUrl = window.location.href;

            // Check Chrome Storage first for solved status
            const { bookmarked, isSolved: cachedSolved } = await checkUrlBookmarked(currentUrl);
            if (cachedSolved && isMounted.current) {
                setIsSolved(true);
            }

            // Always fetch submissions to ensure solved status and streak count are 100% up-to-date!
            try {
                const submissions = await fetchUserStatus(username, 1000);
                if (submissions && submissions.length > 0) {
                    if (problemKey) {
                        const [contestId, problemIndex] = problemKey.split('-');
                        const hasSolved = submissions.some((sub: any) =>
                            sub.verdict === 'OK' &&
                            String(sub.problem?.contestId) === contestId &&
                            sub.problem?.index === problemIndex
                        );

                        if (hasSolved) {
                            if (isMounted.current) setIsSolved(true);
                            if (bookmarked) {
                                await markBookmarkSolved(currentUrl);
                            }
                        }
                    }

                    // Recalculate streak directly from fresh submission history!
                    const freshStreak = calculateStreak(submissions);
                    if (isMounted.current) {
                        setStreakInfo(freshStreak);
                    }
                }
            } catch (e) {
                console.warn('API fetch error:', e);
            }
        };

        checkSolvedStatus();
    }, [handle]);

    return { isSolved, streakInfo, setStreakInfo };
}
