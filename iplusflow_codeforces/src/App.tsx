import { useEffect, useState } from 'react';
import './App.css'; 
import '../styles.css';
import MainUI from './components/MainUI';
import SetupUI from './components/SetupUI';
import { getFriendsList } from './utils/friendsCode';

export default function App() {
  const [handle, setHandle] = useState("");

  useEffect(() => {
    chrome.storage.sync.get(["cf_handle", "cf_friends"], async (data) => {
      if (data.cf_handle && typeof data.cf_handle === "string") {
        setHandle(data.cf_handle);
        if (!data.cf_friends || !Array.isArray(data.cf_friends) || data.cf_friends.length === 0) {
          try {
            const friends = (await getFriendsList()).slice(0, 20);
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
    });
  }, []);

  return (
    <div id="popupRoot">
      {handle ? <MainUI onReset={setHandle} handle={handle} /> : <SetupUI onSave={setHandle} />}
    </div>
  );
}