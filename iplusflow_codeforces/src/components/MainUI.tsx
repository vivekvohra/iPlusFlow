import { useEffect, useState } from 'react';
import type { Problem, MainUIProps } from '../types';

function normalizeProblemKey(url: string | undefined): string | null {
  if (typeof url !== 'string') return null;
  const m =
    url.match(/\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/) ||
    url.match(/\/gym\/(\d+)\/problem\/([A-Za-z0-9]+)/) ||
    url.match(/\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)/) ||
    url.match(/\/edu\/[^/]+\/practice\/contest\/(\d+)\/problem\/([A-Za-z0-9]+)/);
  if (!m) return null;
  return `${m[1]}-${m[2]}`;
}

export default function MainUI({ onReset, handle }: MainUIProps) {

  const [problems, setProblems] = useState<Problem[]>([]);

  const [activeNote, setActiveNote] = useState<Problem | null>(null);

  const [noteText, setNoteText] = useState("");

  const [isSyncing, setIsSyncing] = useState(false);

  const [lastSync, setLastSync] = useState<number | null>(null);

  const [filterOption, setFilterOption] = useState("All");
  const [tagFilterText, setTagFilterText] = useState("");

  const [sortKey, setSortKey] = useState<"title" | "rating" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const problemsWithIndex = problems.map((prob, i) => ({ ...prob, originalIndex: i }));

  const problemsToShow = problemsWithIndex.filter((problem) => {
    // Check the text box (ignoring uppercase/lowercase)
    const tagsString = (problem.tags || []).join(" ").toLowerCase();
    const matchesTag = tagsString.includes(tagFilterText.toLowerCase());

    // Check the dropdown
    let matchesDropdown = true;
    const r = typeof problem.rating === 'number' ? problem.rating : (parseInt(problem.rating, 10) || 0);
    if (filterOption === "<1200") matchesDropdown = r < 1200;
    else if (filterOption === "1200-1600") matchesDropdown = r >= 1200 && r <= 1600;
    else if (filterOption === ">1600") matchesDropdown = r > 1600;
    else if (filterOption === "unsolved") matchesDropdown = !problem.solved;

    // Keep problem only if it passes both checks
    return matchesTag && matchesDropdown;
  });

  const sortedProblemsToShow = [...problemsToShow];
  if (sortKey) {
    const dir = sortOrder === "asc" ? 1 : -1;
    sortedProblemsToShow.sort((a, b) => {
      if (sortKey === 'rating') {
        const pa = typeof a.rating === 'number' ? a.rating : (parseInt(a.rating as string, 10) || 0);
        const pb = typeof b.rating === 'number' ? b.rating : (parseInt(b.rating as string, 10) || 0);
        if (pa !== pb) {
          return (pa - pb) * dir;
        }
        return a.originalIndex - b.originalIndex;
      } else {
        const av = (a.title || '').toLowerCase();
        const bv = (b.title || '').toLowerCase();
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return a.originalIndex - b.originalIndex;
      }
    });
  }

  const handleOpenNote = (problem: Problem) => {
    setActiveNote(problem);
    setNoteText(problem.notes || "");
  };

  useEffect(() => {
    // Fetch bookmarks and last sync from storage on mount
    chrome.storage.sync.get(["bookmarks", "last_sync"], (data) => {
      if (data.bookmarks) {
        setProblems(data.bookmarks as Problem[]);
      }
      if (data.last_sync) {
        setLastSync(data.last_sync as number);
      }
    });
  }, []);

  const handleReset = () => {
    chrome.storage.sync.remove("cf_handle", () => {
      onReset("");
    });
  };

  const handleSaveNote = () => {
    if (!activeNote) return;

    // 1. Copy the whiteboard (noteText) into the filing cabinet (updatedProblems)
    const updatedProblems = problems.map((prob) => {
      if (prob.title === activeNote.title) {
        return { ...prob, notes: noteText };
      }
      return prob;
    });

    // 2. Tell React to update the main monitor
    setProblems(updatedProblems);

    // 3. Close the modal (wipes the whiteboard)
    setActiveNote(null);

    // 4. Save to the Hard Drive (Chrome Storage)
    chrome.storage.sync.set({ bookmarks: updatedProblems });
  };

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      if (!handle) throw new Error('No handle saved');

      const resp = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`);
      const data = await resp.json();
      if (data.status !== 'OK') throw new Error('API error');

      const solvedSet = new Set<string>();
      for (const sub of data.result || []) {
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

      chrome.storage.sync.set({ bookmarks: updatedProblems, last_sync });
    } catch (e) {
      console.warn('Sync failed:', e);
      alert('Failed to sync solved problems.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSort = (clickedKey: "title" | "rating") => {
    if (sortKey === clickedKey) {
      // If the same key is clicked, toggle the order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If a new key is clicked, set it and default to ascending
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
          {/* ⚙️ Change Handle button */}
          <button id="resetHandle" title="Change Codeforces handle" onClick={handleReset}>⚙️</button>
        </div>

        {/* NEW: filter + sync grouped together */}
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

        <table id="table">
          <thead>
            <tr>
              <th>Solved</th>
              <th id="th-title" className="sortable" onClick={() => handleSort("title")}>
                Problem Title
                <span className="sort-indicator">
                  {sortKey === "title" && (sortOrder === "asc" ? "▲" : "▼")}
                </span>
              </th>
              <th id="th-rating" className="sortable" onClick={() => handleSort("rating")}>
                Rating
                <span className="sort-indicator">
                  {sortKey === "rating" && (sortOrder === "asc" ? "▲" : "▼")}
                </span>
              </th>
              <th>Tags</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody id="list">
            {sortedProblemsToShow.map((problem, index) => (
              <tr key={index} className={problem.solved ? "solved-row" : ""}>
                {/* 1. Solved Status */}
                <td>
                  <input type="checkbox" checked={!!problem.solved} disabled />
                </td>

                {/* 2. Problem Title */}
                <td>
                  <a href={problem.url} target="_blank" rel="noopener noreferrer">
                    {problem.title || problem.url || 'Problem'}
                  </a>
                </td>

                {/* 3. Rating */}
                <td>{problem.rating}</td>

                {/* 4. Tags */}
                <td>{(problem.tags || []).join(", ")}</td>

                {/* 5. Notes Button */}
                <td>
                  <button className="edit-notes" title="Edit Notes" onClick={() => handleOpenNote(problem)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>

      {/* Notes Modal */}
      {/* If activeNote is true (contains a problem), render everything inside the parentheses */}
      {activeNote && (
        <div id="notesModal" className="iplus_modal">
          <div className="iplus_modal-content">

            {/* 1. Close button resets state to null to close the modal */}
            <span className="iplus_close-button" id="closeNotes" onClick={() => setActiveNote(null)}>
              &times;
            </span>

            {/* 2. Bonus: We can display the actual problem title in the header! */}
            <h3>Edit Notes for {activeNote.title}</h3>

            {/* 3. Here noteText is the temp storage for notes , when closed it is wiped out  */}
            <textarea
              id="notesText"
              rows={10}
              placeholder="Enter your notes..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            ></textarea>

            <div className="iplus_modal-footer">
              <button id="saveNoteBtn" onClick={handleSaveNote}>
                Save
              </button>

              {/* 3. Cancel button also resets state to null */}
              <button id="cancelNoteBtn" onClick={() => setActiveNote(null)}>
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
