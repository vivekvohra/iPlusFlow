import { useEffect, useState } from 'react';
import './App.css'; // You can keep your styling imports


// setup UI component
function SetupUI({ onSave }) {
  const [inputValue, setInputValue] = useState("");

  const handleSave = () => {
    if (inputValue.trim()) {
      chrome.storage.local.set({ handle: inputValue.trim() }, () => {
        onSave(inputValue.trim());
      });
    }
  };

  return (
    <div id="setup">
      {/* Logo */}
      <img src="icons/icon128.png" alt="iplusflow Logo"
        className="setup-logo" width="64" height="64" />
      <h2>👋 Welcome to iplusflow!</h2>
      <p className="setup-desc">
        Enter your Codeforces handle below so you can bookmark problems and track which ones you’ve solved.
      </p>
      <input type="text" id="handle" placeholder="Enter Codeforces handle" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <button id="saveHandle" onClick={handleSave}>💾 Save Handle</button>
    </div>
  );
}

function MainUI({ onReset }) {

  const handleReset = () => {
    chrome.storage.local.remove("handle", () => {
      onReset("");
    });
  };
  return (
    <>
      <div id="mainUI" className="iplus_hidden">
        <div id="popupHeader">
          <img
            id="popupLogo"
            src="icons/icon128.png"
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
          <select id="filter">
            <option value="All">All</option>
            <option value="<1200">&lt;1200</option>
            <option value="1200-1600">1200–1600</option>
            <option value=">1600">&gt;1600</option>
            <option value="unsolved">Unsolved</option>
          </select>
          <input
            type="text"
            id="tagFilter"
            placeholder="Filter by tag…"
          />
          <button id="sync">🔄 Sync</button>
        </div>

        <p id="lastSync"></p>

        <table id="table">
          <thead>
            <tr>
              <th>Solved</th>
              <th id="th-title" className="sortable">
                Problem Title
                <span className="sort-indicator"></span>
              </th>
              <th id="th-rating" className="sortable">
                Rating
                <span className="sort-indicator"></span>
              </th>
              <th>Tags</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody id="list"></tbody>
        </table>
      </div>

      {/* Notes Modal */}
      <div id="notesModal" className="iplus_modal iplus_hidden">
        <div className="iplus_modal-content">
          <span className="iplus_close-button" id="closeNotes">&times;</span>
          <h3>Edit Notes</h3>
          <textarea
            id="notesText"
            rows={10}
            placeholder="Enter your notes..."
          ></textarea>
          <div className="iplus_modal-footer">
            <button id="saveNoteBtn">Save</button>
            <button id="cancelNoteBtn">Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}





export default function App() {

  const [handle, setHandle] = useState("");

  useEffect(() => {
    chrome.storage.local.get("handle", (data) => {
      if (data.handle && typeof data.handle === "string") {
        setHandle(data.handle);
      }
    });
  }, []);

  return (
    <div id="popupRoot">
      {handle ? <MainUI onReset={setHandle} /> : <SetupUI onSave={setHandle} />}
    </div>
  );
}