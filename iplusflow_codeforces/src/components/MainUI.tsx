import { useEffect, useState } from 'react';
import type { Problem, MainUIProps } from '../types';
import { normalizeProblemKey } from '../utils/urlHelpers';
import { fetchUserStatus } from '../utils/api';
import { getBookmarks, saveBookmarks, updateProblemNotes } from '../utils/storage';
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

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      if (!handle) throw new Error('No handle saved');

      const submissions = await fetchUserStatus(handle, 1000);
      const solvedSet = new Set<string>();
      for (const sub of submissions) {
        if (sub.verdict === 'OK' && sub.problem) {
          const cid = sub.problem.contestId;
          const idx = sub.problem.index;
          if (cid && idx) solvedSet.add(`${cid}-${idx}`);
        }
      }

      const updatedProblems = problems.map((prob) => {
        const key = normalizeProblemKey(prob.url);
        if (!key) return prob;
        return { ...prob, solved: solvedSet.has(key) };
      });

      const last_sync = Date.now();
      setProblems(updatedProblems);
      setLastSync(last_sync);

      await saveBookmarks(updatedProblems);
      chrome.storage.sync.set({ last_sync });

      // Refresh streak after sync
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
      />
    </>
  );
}
