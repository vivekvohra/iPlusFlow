import { useEffect, useState } from 'react';
import './App.css'; 
import '../styles.css';
import MainUI from './components/MainUI';
import SetupUI from './components/SetupUI';

export default function App() {
  const [handle, setHandle] = useState("");

  useEffect(() => {
    chrome.storage.sync.get("cf_handle", (data) => {
      if (data.cf_handle && typeof data.cf_handle === "string") {
        setHandle(data.cf_handle);
      }
    });
  }, []);

  return (
    <div id="popupRoot">
      {handle ? <MainUI onReset={setHandle} handle={handle} /> : <SetupUI onSave={setHandle} />}
    </div>
  );
}