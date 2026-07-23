import { useState } from 'react';
import type { Problem, StreakInfo } from '../types';
import { normalizeProblemKey } from '../utils/urlHelpers';
import { fetchUserStatus } from '../utils/api';
import { getBookmarks, saveBookmarks } from '../utils/storage';
import { getUserStreak } from '../utils/streak';

export function useCodeforcesSync(
  handle: string,
  setProblems: (problems: Problem[]) => void,
  setStreakInfo: (info: StreakInfo) => void
) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);

  const handleSync = async () => {
    if (isSyncing || !handle) return;
    setIsSyncing(true);

    try {
      // 1. Retrieve latest bookmarks directly from storage (prevents operating on stale state)
      const currentBookmarks = await getBookmarks();

      // 2. Query Codeforces API for user's solved submissions
      const submissions = await fetchUserStatus(handle, 1000);
      const solvedSet = new Set<string>();
      for (const sub of submissions) {
        if (sub.verdict === 'OK' && sub.problem) {
          const cid = sub.problem.contestId;
          const idx = sub.problem.index;
          if (cid && idx) solvedSet.add(`${cid}-${idx}`);
        }
      }

      // 3. Mark solved status on all fresh bookmarks (O(N) Set lookup)
      const updatedProblems = currentBookmarks.map((prob) => {
        const key = normalizeProblemKey(prob.url);
        if (!key) return prob;
        return { ...prob, solved: solvedSet.has(key) };
      });

      const now = Date.now();
      setProblems(updatedProblems);
      setLastSync(now);

      await saveBookmarks(updatedProblems);
      await chrome.storage.sync.set({ last_sync: now });

      // 4. Refresh streak after sync with forceRefresh = true
      const freshStreak = await getUserStreak(handle, true);
      setStreakInfo(freshStreak);
    } catch (e) {
      console.warn('Sync failed:', e);
      alert('Failed to sync solved problems.');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    lastSync,
    setLastSync,
    handleSync
  };
}
