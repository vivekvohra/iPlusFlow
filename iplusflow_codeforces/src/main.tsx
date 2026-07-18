import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function PopupRoot() {
  useEffect(() => {
    // When the Chrome toolbar popup opens, close the floating workspace on the active tab so only one is open
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "CLOSE_FLOATING_WORKSPACE" }).catch(() => {});
        }
       });
    }
  }, []);

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PopupRoot />
  </StrictMode>,
)
