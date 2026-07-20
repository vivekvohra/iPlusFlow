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
      <h2>👋 Welcome to iplusflow!</h2>
      <p className="setup-desc">
        Enter your Codeforces handle below so you can bookmark problems and track which ones you’ve solved.
      </p>
      <input type="text" id="handle" placeholder="Enter Codeforces handle" value={inputValue} onChange={(e) => setInputValue(e.target.value)} disabled={isSaving} />
      <button id="saveHandle" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "💾 Save Handle"}
      </button>
    </div>
  );
}

