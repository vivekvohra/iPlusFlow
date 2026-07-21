import { useEffect, useState } from 'react';
import type { Problem, MainUIProps } from '../types';
import { normalizeProblemKey } from '../utils/urlHelpers';
import { fetchUserStatus } from '../utils/api';
import { getBookmarks, saveBookmarks, updateProblemNotes, removeFriendRefFromBookmark } from '../utils/storage';
import { getUserStreak, type StreakInfo } from '../utils/streak';
import { filterProblems, sortProblems } from '../utils/filterHelpers';
import NotesModal from './NotesModal';
import StreakBadge from './StreakBadge';
import ProblemTable from './ProblemTable';

export default function MainUI({ onReset, handle }: MainUIProps) {

  const [problems, setProblems] = useState<Problem[]>([]);
  const [activeNote, setActiveNote] = useState<Problem | null>(null);
  const [noteText, setNoteText] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [streakInfo, setStreakInfo] = useState<StreakInfo>({ currentStreak: 0, longestStreak: 0, lastSolvedDate: null });

  const [filterOption, setFilterOption] = useState("All");
  const [tagFilterText, setTagFilterText] = useState("");

  const [sortKey, setSortKey] = useState<"title" | "rating" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Add original index for stable tie-breaking when sorting
  const problemsWithIndex = problems.map((prob, i) => ({ ...prob, originalIndex: i }));

  // Use extracted filter and sort helper utilities
  const filtered = filterProblems(problemsWithIndex, tagFilterText, filterOption);
  const sortedProblemsToShow = sortProblems(filtered, sortKey, sortOrder);

  const handleOpenNote = (problem: Problem) => {
    // 1. Send signal to open full page-level NotesModal on Codeforces and close FAB panel drawer
    chrome?.storage?.local?.set({ 
      widget_is_open: false, 
      active_page_note: problem 
    });

    // 2. Also set local state for popup fallback if not on Codeforces page
    setActiveNote(problem);
    setNoteText(problem.notes || "");
  };

  useEffect(() => {
    getBookmarks().then(setProblems);
    chrome.storage.sync.get(["last_sync"], (data) => {
      if (data.last_sync) {
        setLastSync(data.last_sync as number);
      }
    });

    if (handle) {
      getUserStreak(handle).then(setStreakInfo);
    }

    // Reactive Storage Listener: Auto-updates UI instantly when bookmarks, notes, or solved status change anywhere!
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === "sync") {
        if (changes.bookmarks) {
          const newBookmarks = (changes.bookmarks.newValue || []) as Problem[];
          setProblems(newBookmarks);
        }
        if (changes.last_sync) {
          setLastSync(changes.last_sync.newValue as number);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [handle]);

  const handleReset = () => {
    chrome.storage.sync.remove("cf_handle", () => {
      onReset("");
    });
  };

  const handleSaveNote = async () => {
    if (!activeNote) return;
    const updatedProblems = await updateProblemNotes(activeNote.url || activeNote.title, noteText);
    setProblems(updatedProblems);
    setActiveNote(null);
  };

  const handleRemoveFriendRef = async (submissionUrl: string) => {
    if (!activeNote) return;
    const updated = await removeFriendRefFromBookmark(activeNote.url, submissionUrl);
    const updatedNote = updated.find((p) => p.url === activeNote.url) || null;
    setActiveNote(updatedNote);
    setProblems(updated);
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      if (!handle) throw new Error('No handle saved');

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

      // 3. Mark solved status on all fresh bookmarks
      const updatedProblems = currentBookmarks.map((prob) => {
        const key = normalizeProblemKey(prob.url);
        if (!key) return prob;
        return { ...prob, solved: solvedSet.has(key) };
      });

      const last_sync = Date.now();
      setProblems(updatedProblems);
      setLastSync(last_sync);

      await saveBookmarks(updatedProblems);
      await chrome.storage.sync.set({ last_sync });

      // 4. Refresh streak after sync
      const freshStreak = await getUserStreak(handle);
      setStreakInfo(freshStreak);

    } catch (e) {
      console.warn('Sync failed:', e);
      alert('Failed to sync solved problems.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSort = (clickedKey: "title" | "rating") => {
    if (sortKey === clickedKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(clickedKey);
      setSortOrder("asc");
    }
  };

  return (
    <>
      <div id="mainUI">
        <div id="popupHeader">
          <img
            id="popupLogo"
            src={typeof chrome !== 'undefined' && chrome?.runtime?.getURL ? chrome.runtime.getURL("icons/icon128.png") : "icons/icon128.png"}
            alt="iplusflow Logo"
            width="64"
            height="64"
          />
          <h3 id="popupTitle">Bookmarked Problems</h3>
          
          <StreakBadge 
            currentStreak={streakInfo.currentStreak} 
            longestStreak={streakInfo.longestStreak} 
          />

          {/* GitHub Repository link */}
          <a
            href="https://github.com/vivekvohra/iPlusFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="github-btn"
            title="View on GitHub (https://github.com/vivekvohra/iPlusFlow)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* ⚙️ Change Handle button */}
          <button id="resetHandle" title="Change Codeforces handle" onClick={handleReset}>⚙️</button>
        </div>

        {/* Filter + Sync controls */}
        <div id="controls">
          <select id="filter" value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
            <option value="All">All</option>
            <option value="&lt;1200">&lt;1200</option>
            <option value="1200-1600">1200–1600</option>
            <option value="&gt;1600">&gt;1600</option>
            <option value="unsolved">Unsolved</option>
          </select>
          <input
            type="text"
            id="tagFilter"
            placeholder="Filter by tag…"
            value={tagFilterText}
            onChange={(e) => setTagFilterText(e.target.value)}
          />
          <button id="sync" onClick={handleSync} disabled={isSyncing}>
            {isSyncing ? "Syncing…" : "🔄 Sync"}
          </button>
        </div>

        <p id="lastSync">
          {lastSync ? `Last sync: ${new Date(lastSync).toLocaleString()}` : ''}
        </p>

        {/* Extracted Problem Table Component */}
        <ProblemTable
          problems={sortedProblemsToShow}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          onOpenNote={handleOpenNote}
        />
      </div>

      {/* Notes Modal */}
      <NotesModal
        activeNote={activeNote}
        noteText={noteText}
        setNoteText={setNoteText}
        onSave={handleSaveNote}
        onClose={() => setActiveNote(null)}
        onRemoveFriendRef={handleRemoveFriendRef}
      />
    </>
  );
}
