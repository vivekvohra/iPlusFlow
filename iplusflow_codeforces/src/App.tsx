import { useEffect, useState } from 'react';
import './App.css'; 
import '../styles.css';
import MainUI from './components/MainUI';
import SetupUI from './components/SetupUI';
import { fetchFriendsList } from './utils/scraper';

export default function App() {
  const [handle, setHandle] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    chrome?.storage?.sync?.get(["cf_handle", "cf_friends"], async (data) => {
      if (data?.cf_handle && typeof data.cf_handle === "string") {
        setHandle(data.cf_handle);
        if (!data.cf_friends || !Array.isArray(data.cf_friends) || data.cf_friends.length === 0) {
          try {
            const friends = (await fetchFriendsList()).slice(0, 20);
            await chrome.storage.sync.set({
              cf_friends: friends,
              cf_friends_count: friends.length,
            });
            console.log('🔁 Auto-fetched friends:', friends.length);
          } catch (e) {
            console.warn('⚠️ Auto-fetch friends failed:', e);
          }
        }
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div id="popupRoot" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '160px', fontFamily: 'Verdana, sans-serif' }}>
        <span style={{ fontSize: '13px', color: '#666' }}>⏳ Loading iPlusFlow…</span>
      </div>
    );
  }

  return (
    <div id="popupRoot">
      {handle ? <MainUI onReset={setHandle} handle={handle} /> : <SetupUI onSave={setHandle} />}
    </div>
  );
}