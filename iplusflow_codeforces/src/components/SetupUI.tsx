import { useState } from 'react';
import type { SetupUIProps } from '../types';
import { fetchFriendsList } from '../utils/scraper';
import { fetchUserInfo } from '../utils/api';

// setup UI component
export default function SetupUI({ onSave }: SetupUIProps) {
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const handle = inputValue.trim();

    if (!/^[A-Za-z0-9._-]{2,32}$/.test(handle)) {
      alert('Please enter a valid Codeforces handle.');
      return;
    }

    setIsSaving(true);

    try {
      const info = await fetchUserInfo(handle);
      if (!info) {
        alert('Handle not found. Please check spelling and try again.');
        return;
      }

      await chrome.storage.sync.set({ cf_handle: handle });

      // Try to fetch friends list (non-blocking)
      try {
        const friends = (await fetchFriendsList(handle)).slice(0, 20);
        await chrome.storage.sync.set({
          cf_friends: friends,
          cf_friends_count: friends.length
        });
        console.log('✅ Friends list saved:', friends.length, friends.slice(0, 10));
      } catch (e) {
        console.warn('Fetching friends failed (non-blocking):', e);
      }

      onSave(handle);
    } catch (e) {
      console.error(e);
      alert('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="setup">
      {/* Logo */}
      <img src={typeof chrome !== 'undefined' && chrome?.runtime?.getURL ? chrome.runtime.getURL("icons/icon128.png") : "icons/icon128.png"} alt="iplusflow Logo"
        className="setup-logo" width="64" height="64" />
      <h2>👋 Welcome to iPlusFlow!</h2>
      <p className="setup-desc">
        Enter your Codeforces handle below so you can bookmark problems and track which ones you’ve solved.
      </p>
      <input type="text" id="handle" placeholder="Enter Codeforces handle" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isSaving} />
      <button id="saveHandle" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "💾 Save Handle"}
      </button>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <a 
          href="https://github.com/vivekvohra/iPlusFlow" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="setup-github-btn"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>View on GitHub</span>
          <span className="github-star-tag">⭐ Star</span>
        </a>
      </div>
    </div>
  );
}
