/* ==========================================================================
   iPlusFlow Application Controller - Comprehensive Architecture & HLD/LLD Book
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initViewMode();
  initNavigation();
  initShadowDomSandbox();
  initScraperSandbox();
  initExtensionPopupSimulator();
  initDraggableOrbSandbox();
  initStreakCalendarSandbox();
  initStorageInspectorSandbox();
  initModalListeners();
});

/* ==========================================================================
   0. DUAL VIEW MODE SWITCHER (PRODUCT LANDING vs ARCHITECTURE MANUAL)
   ========================================================================== */
function initViewMode() {
  if (window.location.hash && window.location.hash !== '#product-landing') {
    setViewMode('arch');
  } else {
    setViewMode('product');
  }
}

function setViewMode(mode) {
  const btnProduct = document.getElementById('btn-mode-product');
  const btnArch = document.getElementById('btn-mode-arch');

  if (mode === 'product') {
    document.body.classList.add('mode-product');
    document.body.classList.remove('mode-arch');
    if (btnProduct) btnProduct.classList.add('active');
    if (btnArch) btnArch.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (mode === 'arch') {
    document.body.classList.add('mode-arch');
    document.body.classList.remove('mode-product');
    if (btnArch) btnArch.classList.add('active');
    if (btnProduct) btnProduct.classList.remove('active');

    const activePage = document.querySelector('.page-view.active');
    if (!activePage) {
      const overviewLink = document.querySelector('a[data-page="overview"]');
      if (overviewLink) overviewLink.click();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/* ==========================================================================
   1. NAVIGATION ENGINE
   ========================================================================== */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .app-nav-item a');
  const pageViews = document.querySelectorAll('.page-view');

  function switchPage(targetId) {
    if (!targetId) return;

    const effectivePageId = (targetId === 'sre-specs') ? 'sde-notes' : targetId;

    navLinks.forEach(l => {
      const pageAttr = l.getAttribute('data-page') || (l.getAttribute('href') ? l.getAttribute('href').replace('#', '') : '');
      if (pageAttr === targetId || pageAttr === effectivePageId) {
        l.classList.add('active');
        if (l.parentElement && l.parentElement.classList.contains('app-nav-item')) {
          l.parentElement.classList.add('active');
        }
      } else {
        l.classList.remove('active');
        if (l.parentElement && l.parentElement.classList.contains('app-nav-item')) {
          l.parentElement.classList.remove('active');
        }
      }
    });

    pageViews.forEach(view => {
      if (view.id === effectivePageId) {
        view.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        view.classList.remove('active');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const pageAttr = link.getAttribute('data-page');

      if (pageAttr || (href && href.startsWith('#'))) {
        e.preventDefault();
        const targetId = pageAttr || href.replace('#', '');
        window.location.hash = targetId;
        switchPage(targetId);
      }
    });
  });

  if (window.location.hash) {
    switchPage(window.location.hash.replace('#', ''));
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash) {
      switchPage(window.location.hash.replace('#', ''));
    }
  });
}

function scrollToSec(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

/* ==========================================================================
   2. SHADOW DOM PORTAL SIMULATOR (content.tsx & domHelpers.ts Logic)
   ========================================================================== */
function initShadowDomSandbox() {
  const injectBtn = document.getElementById('btn-inject-portals');
  const toggleTagsBtn = document.getElementById('btn-toggle-sim-tags');
  const resetBtn = document.getElementById('btn-reset-sim');
  
  const simTitle = document.getElementById('sim-cf-title');
  const simTagsContainer = document.getElementById('sim-cf-tags');
  const simSidebar = document.getElementById('sim-cf-sidebar');

  let areTagsHidden = false;
  let portalsInjected = false;

  if (injectBtn && simTitle) {
    injectBtn.addEventListener('click', () => {
      if (portalsInjected) return;
      portalsInjected = true;

      // 1. Injected Bookmark & Note Buttons into Title (.problem-statement .title)
      const actionGroup = document.createElement('span');
      actionGroup.className = 'injected-portal-group';
      actionGroup.style.display = 'inline-flex';
      actionGroup.style.alignItems = 'center';
      actionGroup.style.gap = '6px';
      actionGroup.innerHTML = `
        <button class="cf-button" onclick="event.preventDefault();">🔖 Bookmark</button>
        <button class="cf-button" onclick="event.preventDefault();">✍️ Add Note</button>
        <button class="cf-button red" onclick="event.preventDefault();">❌ Remove</button>
      `;
      simTitle.appendChild(actionGroup);

      // 2. Injected Progress Card below Contest Info Box in #sidebar
      const firstBox = simSidebar.querySelector('.roundbox');
      const progressRoundbox = document.createElement('div');
      progressRoundbox.className = 'roundbox sidebox injected-portal-group';
      progressRoundbox.style.marginBottom = '1em';
      progressRoundbox.innerHTML = `
        <div class="caption titled">→ Progress</div>
        <div class="roundbox-body borderBottom" style="padding:8px 12px; font-size:12px;">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px; color:#0a0; font-weight:bold;">
            <span>✓ Solved</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px; color:#333;">
            <span>🔥 4 Days Streak</span>
          </div>
          <div style="display:flex; align-items:center; gap:6px; color:#333;">
            <span>⏱ Solved Today: 1</span>
          </div>
        </div>
      `;
      if (firstBox && firstBox.nextSibling) {
        simSidebar.insertBefore(progressRoundbox, firstBox.nextSibling);
      } else {
        simSidebar.appendChild(progressRoundbox);
      }

      // 3. Injected Friends' Accepted Submissions Box into bottom of #sidebar
      const friendsRoundbox = document.createElement('div');
      friendsRoundbox.className = 'roundbox sidebox injected-portal-group';
      friendsRoundbox.style.marginTop = '1em';
      friendsRoundbox.innerHTML = `
        <div class="caption titled">
          → Friends' Submissions
        </div>
        <div class="roundbox-body" style="max-height:180px; overflow-y:auto; overflow-x:hidden;">
        <table className="rtable" style="width:100%; table-layout:fixed; border-collapse:collapse; font-size:11px; margin:0;">
          <thead>
            <tr style="background:#f8f8f8;">
              <th style="width:28%; padding:4px 4px; border:1px solid #e1e1e1; text-align:left; font-weight:bold; color:#000; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Friend</th>
              <th style="width:34%; padding:4px 4px; border:1px solid #e1e1e1; text-align:left; font-weight:bold; color:#000; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Language</th>
              <th style="width:26%; padding:4px 2px; border:1px solid #e1e1e1; text-align:center; font-weight:bold; color:#000;">Code</th>
              <th style="width:12%; padding:4px 2px; border:1px solid #e1e1e1; text-align:center; font-weight:bold; color:#000;">📌</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding:3px 4px; border:1px solid #e1e1e1; background:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <span style="color:#0000cc; font-weight:bold;">tourist</span>
              </td>
              <td style="padding:3px 4px; border:1px solid #e1e1e1; color:#333; background:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">GNU C++20</td>
              <td style="padding:3px 2px; border:1px solid #e1e1e1; text-align:center; background:#fff;">
                <span style="color:#003399; font-weight:bold; text-decoration:underline; font-size:10.5px; cursor:default;">Show Code</span>
              </td>
              <td style="padding:2px 2px; border:1px solid #e1e1e1; text-align:center; background:#fff;">
                <span style="color:#666; font-size:11px; cursor:default;">Save</span>
              </td>
            </tr>
            <tr>
              <td style="padding:3px 4px; border:1px solid #e1e1e1; background:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <span style="color:#0000cc; font-weight:bold;">Benq</span>
              </td>
              <td style="padding:3px 4px; border:1px solid #e1e1e1; color:#333; background:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Python 3.11</td>
              <td style="padding:3px 2px; border:1px solid #e1e1e1; text-align:center; background:#fff;">
                <span style="color:#003399; font-weight:bold; text-decoration:underline; font-size:10.5px; cursor:default;">Show Code</span>
              </td>
              <td style="padding:2px 2px; border:1px solid #e1e1e1; text-align:center; background:#fff;">
                <span style="color:#666; font-size:11px; cursor:default;">Save</span>
              </td>
            </tr>
            <tr>
              <td style="padding:3px 4px; border:1px solid #e1e1e1; background:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                <span style="color:#0000cc; font-weight:bold;">Neal</span>
              </td>
              <td style="padding:3px 4px; border:1px solid #e1e1e1; color:#333; background:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Java 21</td>
              <td style="padding:3px 2px; border:1px solid #e1e1e1; text-align:center; background:#fff;">
                <span style="color:#003399; font-weight:bold; text-decoration:underline; font-size:10.5px; cursor:default;">Show Code</span>
              </td>
              <td style="padding:2px 2px; border:1px solid #e1e1e1; text-align:center; background:#fff;">
                <span style="color:#666; font-size:11px; cursor:default;">Save</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      `;
      simSidebar?.appendChild(friendsRoundbox);

      injectBtn.textContent = '✅ Real Extension Portals Injected!';
      injectBtn.style.background = '#10b981';
      injectBtn.style.color = '#ffffff';
    });
  }

  if (toggleTagsBtn && simTagsContainer) {
    toggleTagsBtn.addEventListener('click', () => {
      areTagsHidden = !areTagsHidden;
      simTagsContainer.style.display = areTagsHidden ? 'none' : 'flex';
      toggleTagsBtn.textContent = areTagsHidden ? '👁️ Show Simulated Tags' : '🙈 Hide Simulated Tags';
    });
  }

  if (resetBtn && simTitle) {
    resetBtn.addEventListener('click', () => {
      portalsInjected = false;
      areTagsHidden = false;
      if (simTagsContainer) simTagsContainer.style.display = 'flex';
      
      const injected = document.querySelectorAll('.injected-portal-group');
      injected.forEach(el => el.remove());

      if (injectBtn) {
        injectBtn.textContent = '🚀 Trigger React Portal Injection';
        injectBtn.style.background = '';
        injectBtn.style.color = '';
      }
      if (toggleTagsBtn) {
        toggleTagsBtn.textContent = '🙈 Hide Simulated Tags';
      }
    });
  }
}

/* ==========================================================================
   3. PEER LEARNING SCRAPER & PARSER SIMULATOR (scraper.ts & friendsCode.ts)
   ========================================================================== */
function initScraperSandbox() {
  const runBtn = document.getElementById('btn-run-scraper');
  const logBox = document.getElementById('scraper-logs');
  const codeDisplay = document.getElementById('scraper-code-preview');
  const friendSelect = document.getElementById('sim-friend-select');

  const sampleCodes = {
    'tourist': {
      langName: 'GNU C++20 (64)',
      subId: 265891234,
      code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    int w;
    if (cin >> w) {
        if (w > 2 && w % 2 == 0) cout << "YES\\n";
        else cout << "NO\\n";
    }
    return 0;
}`
    },
    'Benq': {
      langName: 'Python 3.11 / PyPy 3',
      subId: 265891987,
      code: `import sys

def solve():
    w = int(sys.stdin.readline().strip())
    if w > 2 and w % 2 == 0:
        print("YES")
    else:
        print("NO")

if __name__ == '__main__':
    solve()`
    },
    'Neal': {
      langName: 'Java 21',
      subId: 265892456,
      code: `import java.util.Scanner;

public class Watermelon {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int w = sc.nextInt();
            System.out.println((w > 2 && w % 2 == 0) ? "YES" : "NO");
        }
    }
}`
    }
  };

  if (runBtn && logBox && codeDisplay) {
    runBtn.addEventListener('click', async () => {
      const selected = friendSelect ? friendSelect.value : 'tourist';
      const data = sampleCodes[selected] || sampleCodes['tourist'];

      runBtn.disabled = true;
      runBtn.textContent = '⏳ Executing Scraper Workflow...';
      logBox.innerHTML = '';
      codeDisplay.innerHTML = '<span style="color:#666">Waiting for code extraction...</span>';

      const appendLog = (msg, color = '#222') => {
        const div = document.createElement('div');
        div.style.color = color;
        div.style.marginBottom = '4px';
        div.style.fontFamily = 'monospace';
        div.innerHTML = msg;
        logBox.appendChild(div);
        logBox.scrollTop = logBox.scrollHeight;
      };

      appendLog('⚙️ [Step 1] Querying chrome.storage.local for cached friends list...', '#003399');
      await new Promise(r => setTimeout(r, 350));

      appendLog(`👥 [Step 2] Found active friend handles: ["tourist", "Benq", "Neal"]. Targeting "${selected}"`, '#008000');
      await new Promise(r => setTimeout(r, 450));

      appendLog(`🌐 [Step 3] Fetching submission status for Problem 4A (Watermelon)...`, '#d97706');
      await new Promise(r => setTimeout(r, 550));

      appendLog(`✅ [Step 4] Accepted Submission found! ID: ${data.subId}. Fetching raw HTML...`, '#008000');
      await new Promise(r => setTimeout(r, 450));

      appendLog(`🧪 [Step 5] DOMParser extracting <pre class="prettyprint"> code block (${data.langName})...`, '#aa00aa');
      await new Promise(r => setTimeout(r, 350));

      appendLog('🚀 [Step 6] Code successfully rendered inside Shadow DOM Modal!', '#003399');

      const safeCode = data.code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      codeDisplay.innerHTML = `
        <div style="font-size:12px; color:#555; margin-bottom:6px; font-weight:bold; border-bottom:1px solid #ccc; padding-bottom:4px;">
          Friend: ${selected} | Language: ${data.langName} | Submission #${data.subId}
        </div>
        <pre class="prettyprint" style="margin:0; background:#ffffff; padding:10px; border:1px solid #ccc; font-family:Consolas, monospace; font-size:13px; color:#000;"><code>${safeCode}</code></pre>
      `;

      runBtn.disabled = false;
      runBtn.textContent = '⚡ Execute Scraper Workflow Simulation';
    });
  }
}

/* ==========================================================================
   4. REAL EXTENSION DEFAULT POPUP SIMULATOR (MainUI, ProblemTable, NotesModal)
   ========================================================================== */
let dummyProblemsList = [
  { title: "A. Watermelon", rating: 800, solved: true, tags: ["math", "brute force"], notes: "Corner case: w=2 is impossible because 2 = 1+1 (1 is odd).", url: "https://codeforces.com/problemset/problem/4/A" },
  { title: "B. Queue at the School", rating: 800, solved: true, tags: ["strings", "simulation"], notes: "Swap adjacent BG pairs for t time steps.", url: "https://codeforces.com/problemset/problem/266/B" },
  { title: "A. Next Round", rating: 800, solved: false, tags: ["implementation"], notes: "Check score >= kth participant score and score > 0.", url: "https://codeforces.com/problemset/problem/158/A" },
  { title: "C. Common Divisors", rating: 1300, solved: false, tags: ["math", "number theory"], notes: "Find overall GCD of array, then count factors.", url: "https://codeforces.com/problemset/problem/1203/C" },
  { title: "D. Pair of Topics", rating: 1600, solved: false, tags: ["binary search", "two pointers"], notes: "Reorder equation a_i - b_i > b_j - a_j and sort.", url: "https://codeforces.com/problemset/problem/1324/D" }
];

let activeEditingTitle = null;

function initExtensionPopupSimulator() {
  const filterSelect = document.getElementById('sim-popup-filter');
  const tagInput = document.getElementById('sim-popup-tag-input');
  const syncBtn = document.getElementById('sync');
  const tableBody = document.getElementById('sim-popup-table-body');
  const lastSyncText = document.getElementById('lastSync');

  function renderTable() {
    if (!tableBody) return;

    const filterVal = filterSelect ? filterSelect.value : 'All';
    const tagVal = tagInput ? tagInput.value.trim().toLowerCase() : '';

    const filtered = dummyProblemsList.filter(p => {
      if (filterVal === '<1200' && p.rating >= 1200) return false;
      if (filterVal === '1200-1600' && (p.rating < 1200 || p.rating > 1600)) return false;
      if (filterVal === '>1600' && p.rating <= 1600) return false;
      if (filterVal === 'unsolved' && p.solved) return false;

      if (tagVal) {
        const matchesTag = p.tags.some(t => t.toLowerCase().includes(tagVal));
        const matchesTitle = p.title.toLowerCase().includes(tagVal);
        if (!matchesTag && !matchesTitle) return false;
      }
      return true;
    });

    tableBody.innerHTML = filtered.map(p => `
      <tr class="${p.solved ? 'solved-row' : ''}">
        <td style="text-align:center;"><input type="checkbox" ${p.solved ? 'checked' : ''} disabled /></td>
        <td style="word-break:break-word;"><a href="${p.url}" target="_blank">${p.title}</a></td>
        <td>${p.rating}</td>
        <td style="word-break:break-word;">${p.tags.join(', ')}</td>
        <td style="text-align:center;"><button class="edit-notes" onclick="openExtNoteModal('${p.title.replace(/'/g, "\\'")}', '${p.notes.replace(/'/g, "\\'")}')">Edit</button></td>
      </tr>
    `).join('');
  }

  if (filterSelect) filterSelect.addEventListener('change', renderTable);
  if (tagInput) tagInput.addEventListener('input', renderTable);

  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.textContent = 'Syncing…';
      await new Promise(r => setTimeout(r, 600));

      if (lastSyncText) {
        lastSyncText.textContent = `Last sync: ${new Date().toLocaleString()}`;
      }

      syncBtn.disabled = false;
      syncBtn.textContent = '🔄 Sync';
      renderTable();
    });
  }

  renderTable();
}

function openExtNoteModal(title, currentNote) {
  activeEditingTitle = title;
  const modal = document.getElementById('ext-notes-modal');
  const titleEl = document.getElementById('ext-note-title');
  const textEl = document.getElementById('ext-note-text');

  if (titleEl) titleEl.textContent = `Edit Notes for ${title}`;
  if (textEl) textEl.value = currentNote || '';
  if (modal) modal.classList.add('active');
}

function closeExtNoteModal() {
  const modal = document.getElementById('ext-notes-modal');
  if (modal) modal.classList.remove('active');
  activeEditingTitle = null;
}

function saveExtNoteModal() {
  const textEl = document.getElementById('ext-note-text');
  const newNote = textEl ? textEl.value : '';

  if (activeEditingTitle) {
    const target = dummyProblemsList.find(p => p.title === activeEditingTitle);
    if (target) {
      target.notes = newNote;
    }
  }

  closeExtNoteModal();

  const filterSelect = document.getElementById('sim-popup-filter');
  if (filterSelect) {
    filterSelect.dispatchEvent(new Event('change'));
  }
}

/* ==========================================================================
   5. FLOATING ORB PHYSICS & SNAPPING ENGINE (Exact getSlotY from layout.ts)
   ========================================================================== */
function getSlotY(slot, containerHeight) {
  if (slot === 'top') return 20;
  if (slot === 'middle') return containerHeight / 2 - 25;
  return containerHeight - 70; // bottom
}

function initDraggableOrbSandbox() {
  const orb = document.getElementById('sandbox-orb');
  const drawer = document.getElementById('sandbox-drawer');
  const orbContainer = document.getElementById('orb-container');
  const posDisplay = document.getElementById('orb-pos-display');
  const closeDrawerBtn = document.getElementById('btn-close-drawer');
  const slotBtns = document.querySelectorAll('.btn-slot');

  if (!orb || !orbContainer) return;

  let isDragging = false;
  let isDrawerOpen = false;
  let dragStartTime = 0;
  let dragStartY = 0;
  let activeSlot = 'bottom';

  function updateDrawerPosition(targetY) {
    if (!drawer) return;
    const containerHeight = orbContainer.clientHeight;
    let drawerTop = Math.max(10, Math.min(targetY - 180, containerHeight - 500));
    if (activeSlot === 'top') drawerTop = 15;
    if (activeSlot === 'bottom') drawerTop = Math.max(10, containerHeight - 520);
    drawer.style.top = `${drawerTop}px`;
  }

  function snapToSlot(slotName) {
    const containerHeight = orbContainer.clientHeight;
    const targetY = getSlotY(slotName, containerHeight);
    activeSlot = slotName;

    orb.style.transition = 'top 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)';
    orb.style.right = '20px';
    orb.style.top = `${targetY}px`;

    updateDrawerPosition(targetY);

    setTimeout(() => { orb.style.transition = ''; }, 250);

    if (posDisplay) {
      posDisplay.textContent = `Right Edge Fixed (20px) | Current Active Slot: "${slotName}" | Y: ${Math.round(targetY)}px | Extension Popup: ${isDrawerOpen ? 'Open' : 'Closed (Click Orb to Open)'}`;
    }
  }

  slotBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-slot');
      if (slot) snapToSlot(slot);
    });
  });

  orb.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartTime = Date.now();
    dragStartY = e.clientY;
    orb.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const containerRect = orbContainer.getBoundingClientRect();
    let top = e.clientY - containerRect.top - 25;
    const maxTop = containerRect.height - orb.offsetHeight;
    top = Math.max(10, Math.min(top, maxTop));

    orb.style.right = '20px';
    orb.style.top = `${top}px`;

    if (posDisplay) {
      posDisplay.textContent = `Right Edge Fixed (20px) | Dragging Y: ${Math.round(top)}px | Extension Popup: ${isDrawerOpen ? 'Open' : 'Closed'}`;
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    orb.style.cursor = 'grab';

    const deltaY = Math.abs(e.clientY - dragStartY);
    const deltaTime = Date.now() - dragStartTime;

    if (deltaY < 5 && deltaTime < 250) {
      isDrawerOpen = !isDrawerOpen;
      if (drawer) {
        drawer.style.display = isDrawerOpen ? 'block' : 'none';
        updateDrawerPosition(orb.offsetTop);
      }
      if (posDisplay) {
        posDisplay.textContent = `Right Edge Fixed (20px) | Current Active Slot: "${activeSlot}" | Extension Popup: ${isDrawerOpen ? 'Open' : 'Closed'}`;
      }
      return;
    }

    const containerHeight = orbContainer.clientHeight;
    const topSlot = getSlotY('top', containerHeight);
    const midSlot = getSlotY('middle', containerHeight);
    const botSlot = getSlotY('bottom', containerHeight);

    const currentY = orb.offsetTop;
    const diffTop = Math.abs(currentY - topSlot);
    const diffMid = Math.abs(currentY - midSlot);
    const diffBot = Math.abs(currentY - botSlot);

    const minDiff = Math.min(diffTop, diffMid, diffBot);
    let selectedSlot = 'bottom';

    if (minDiff === diffTop) {
      selectedSlot = 'top';
    } else if (minDiff === diffMid) {
      selectedSlot = 'middle';
    }

    snapToSlot(selectedSlot);
  });

  if (closeDrawerBtn) {
    closeDrawerBtn.addEventListener('click', () => {
      isDrawerOpen = false;
      if (drawer) drawer.style.display = 'none';
      if (posDisplay) {
        posDisplay.textContent = `Right Edge Fixed (20px) | Current Active Slot: "${activeSlot}" | Extension Popup: Closed`;
      }
    });
  }
}

/* ==========================================================================
   6. REAL DAILY STREAK CALCULATION ENGINE (Exact algorithm from streak.ts)
   ========================================================================== */
function calculateStreakFromDates(dateList) {
  if (!dateList || dateList.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastSolvedDate: null };
  }

  const dateSet = new Set(dateList);
  const dates = Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let currentStreak = 0;
  let checkDate = dates.includes(today) ? today : (dates.includes(yesterday) ? yesterday : null);

  if (checkDate) {
    let cursor = new Date(checkDate);
    while (true) {
      const cursorStr = cursor.toISOString().split('T')[0];
      if (dateSet.has(cursorStr)) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  const ascDates = Array.from(dateSet).sort((a, b) => a.localeCompare(b));
  let prevDate = null;

  for (const dStr of ascDates) {
    const currDate = new Date(dStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    prevDate = currDate;
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, longestStreak),
    lastSolvedDate: dates[0] || null
  };
}

function initStreakCalendarSandbox() {
  const cells = document.querySelectorAll('.streak-day-cell');
  const counterDisplay = document.getElementById('streak-counter-value');

  if (!cells || cells.length === 0 || !counterDisplay) return;

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();

  cells.forEach((cell, idx) => {
    const dayAttr = cell.getAttribute('data-day');
    const dayIdx = dayAttr !== null ? parseInt(dayAttr, 10) : idx;
    
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - dayIdx));
    
    const dayName = dayNames[d.getDay()];
    const isAct = cell.classList.contains('active');
    cell.innerHTML = `${dayName}<br>${isAct ? '✅' : '❌'}`;
  });

  function runStreakCalculation() {
    const activeDates = [];

    cells.forEach((cell, idx) => {
      const dayAttr = cell.getAttribute('data-day');
      const dayIdx = dayAttr !== null ? parseInt(dayAttr, 10) : idx;

      if (cell.classList.contains('active')) {
        const d = new Date(today);
        d.setDate(today.getDate() - (13 - dayIdx));
        activeDates.push(d.toISOString().split('T')[0]);
      }
    });

    const info = calculateStreakFromDates(activeDates);
    counterDisplay.textContent = `${info.currentStreak} ${info.currentStreak === 1 ? 'Day' : 'Days'} (Record: ${info.longestStreak} ${info.longestStreak === 1 ? 'Day' : 'Days'})`;
  }

  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      cell.classList.toggle('active');
      const isAct = cell.classList.contains('active');
      const dayText = cell.innerHTML.split('<br>')[0];
      cell.innerHTML = `${dayText}<br>${isAct ? '✅' : '❌'}`;
      runStreakCalculation();
    });
  });

  runStreakCalculation();
}

/* ==========================================================================
   7. STORAGE INSPECTOR ENGINE (Exact schema from storage.ts)
   ========================================================================== */
function initStorageInspectorSandbox() {
  const inspectBtn = document.getElementById('btn-inspect-storage');
  const storageOutput = document.getElementById('storage-inspector-output');

  if (!inspectBtn || !storageOutput) return;

  const mockStorageData = {
    "chrome.storage.sync (100KB Limit, 8KB/Item)": {
      "user_handle": "vivekvohra",
      "bookmarks": dummyProblemsList,
      "user_notes": {
        "4A": "Corner case: w=2 is impossible because 2 = 1+1 (1 is odd)."
      }
    },
    "chrome.storage.local (5MB Heavy Cache)": {
      "cached_friends": ["tourist", "Benq", "Neal"],
      "last_api_sync": new Date().toISOString(),
      "widget_y_slot": "bottom",
      "widget_is_open": false,
      "streak_vivekvohra": {
        "timestamp": Date.now(),
        "info": { "currentStreak": 4, "longestStreak": 14, "lastSolvedDate": new Date().toISOString().split('T')[0] }
      }
    }
  };

  inspectBtn.addEventListener('click', () => {
    storageOutput.textContent = JSON.stringify(mockStorageData, null, 2);
  });
}

/* ==========================================================================
   8. COMPREHENSIVE TECHNICAL KNOWLEDGE BASE MODAL ENGINE (CONCISE & HUMAN)
   ========================================================================== */
const modalDatabase = {
    'mv3-service-worker': {
        title: '⚡ MV3 Service Worker Lifecycle & Ephemeral Model',
        content: `
            <div class="qa-card">
                <div class="question">How does Manifest V3 Service Worker differ from Manifest V2 Background Pages?</div>
                <div class="answer">
                    MV2 background scripts stayed in memory permanently, consuming continuous RAM.<br><br>
                    MV3 uses <strong>ephemeral Service Workers</strong> that Chrome shuts down after 30 seconds of inactivity to save system resources and battery.
                </div>
            </div>

            <div class="qa-card">
                <div class="question">How do we persist state when Chrome terminates the worker?</div>
                <div class="answer">
                    1. <strong>No Global RAM State:</strong> In-memory variables are wiped on shutdown.<br>
                    2. <strong>Chrome Storage First:</strong> Save all bookmarks, handles, and notes directly to <code class="inline-code">chrome.storage.sync</code>.<br>
                    3. <strong>Top-Level Listener Registration:</strong> Register <code class="inline-code">chrome.runtime.onMessage</code> synchronously at the root scope so Chrome can wake up the worker on incoming events.
                </div>
            </div>
        `
    },

    'shadow-dom-encapsulation': {
        title: '🛡️ Shadow DOM Forcefield & React Portals',
        content: `
            <div class="qa-card">
                <div class="question">WHY Shadow DOM? (The CSS Bleed Problem)</div>
                <div class="answer">
                    Codeforces uses legacy CSS with global rules like <code class="inline-code">div { font-family: Arial }</code> and global table styling.<br><br>
                    Direct DOM injection causes Codeforces styles to distort extension UI, and extension CSS to distort Codeforces page elements. Creating a Shadow Root (<code class="inline-code">host.attachShadow({ mode: 'open' })</code>) provides a 100% protective style forcefield in both directions.
                </div>
            </div>

            <div class="qa-card">
                <div class="question">HOW React Portals & domHelpers work together</div>
                <div class="answer">
                    1. <code class="inline-code">findCodeforcesContainers()</code> queries native target nodes (<code class="inline-code">.problem-statement .title</code>, <code class="inline-code">#sidebar</code>).<br>
                    2. <code class="inline-code">ReactDOM.createPortal</code> projects specific UI components into these targets while keeping React state centralized in the Shadow Root.<br>
                    3. <code class="inline-code">removeCodeforcesContainers()</code> cleans up wrapper nodes on unmount to prevent DOM memory leaks.
                </div>
            </div>
        `
    },

    'chrome-storage-quotas': {
        title: '💾 Storage Tiering & O(1) Set Lookup Optimization',
        content: `
            <div class="qa-card">
                <div class="question">WHY and HOW Chrome Storage is Tiered</div>
                <div class="answer">
                    <table class="datatable">
                        <tr><th>Storage API</th><th>Capacity</th><th>Quota Limit</th><th>Use Case in iPlusFlow</th></tr>
                        <tr><td><code class="inline-code">chrome.storage.sync</code></td><td>100 KB</td><td>8 KB / key</td><td>Cross-device bookmarks, handles, user markdown notes</td></tr>
                        <tr><td><code class="inline-code">chrome.storage.local</code></td><td>5 MB+</td><td>None</td><td>Cached friend submissions, streak history, orb coordinates</td></tr>
                    </table>
                </div>
            </div>

            <div class="qa-card">
                <div class="question">O(1) Set Lookup Optimization in handleSync</div>
                <div class="answer">
                    When syncing solves via <code class="inline-code">user.status</code>, checking solved problems in a raw array takes $O(N \\times M)$ time.<br><br>
                    iPlusFlow maps solved problem keys (<code class="inline-code">contestId-index</code>) into a native JavaScript <code class="inline-code">Set&lt;string&gt;</code>, reducing solve verification lookups to **$O(1)$ constant time**.
                </div>
            </div>
        `
    },

    'derived-state-architecture': {
        title: '🎯 Derived State Filtering & Sorting Architecture',
        content: `
            <div class="qa-card">
                <div class="question">WHY Derived State instead of Redundant Array State?</div>
                <div class="answer">
                    In early implementations, keeping a separate <code class="inline-code">filteredBookmarks</code> array required manual state updates whenever tags, rating dropdowns, or bookmarks changed, leading to state synchronization bugs.<br><br>
                    iPlusFlow uses <strong>Derived State</strong>: <code class="inline-code">problemsToShow</code> is computed on the fly right before render using pure helper functions (<code class="inline-code">filterProblems</code> & <code class="inline-code">sortProblems</code>). React recalculates this array automatically on state changes with zero synchronization bugs.
                </div>
            </div>
        `
    },

    'peer-learning-scraper': {
        title: '👥 Friends\' Solution Scraper & DOMParser Pipeline',
        content: `
            <div class="qa-card">
                <div class="question">WHY a Scraper is Required & HOW it works</div>
                <div class="answer">
                    The official Codeforces JSON API returns submission metadata, but <strong>never returns raw user source code</strong> strings.<br><br>
                    1. Fetches <code class="inline-code">https://codeforces.com/friends</code> background HTML to extract active friend handles.<br>
                    2. Queries <code class="inline-code">contest.status</code> (fast) or falls back to <code class="inline-code">user.status</code> to identify submissions with verdict <code class="inline-code">OK</code>.<br>
                    3. Implements an artificial <code class="inline-code">sleep(700ms)</code> delay via <code class="inline-code">rateLimitedFetch()</code> to prevent HTTP 429 rate limit bans.<br>
                    4. Parses submission HTML using <code class="inline-code">new DOMParser().parseFromString()</code> and extracts <code class="inline-code">&lt;pre class="prettyprint"&gt;</code> code blocks safely without script execution.
                </div>
            </div>
        `
    },

    'component-lifecycle-memory': {
        title: '⚡ Component Lifecycle & Memory Leak Prevention',
        content: `
            <div class="qa-card">
                <div class="question">HOW memory leaks are prevented during SPA navigation</div>
                <div class="answer">
                    1. <strong>isMounted Ref Guard:</strong> Asynchronous scraping operations check <code class="inline-code">isMounted.current</code> before updating state. If the user navigates away mid-fetch, state updates are aborted.<br>
                    2. <strong>React Root Cleanup:</strong> Calls <code class="inline-code">root.unmount()</code> on Shadow DOM roots when navigating away from problem pages.<br>
                    3. <strong>WeakMap References:</strong> Uses <code class="inline-code">WeakMap</code> for temporary DOM element caching so garbage collection reclaims memory automatically.
                </div>
            </div>
        `
    },

    'modular-react-architecture': {
        title: '🧩 Codebase Modularization: Centralized Types & Decoupled Hooks',
        content: `
            <div class="qa-card">
                <div class="question">Why Centralize Component Props in types/index.ts?</div>
                <div class="answer">
                    In early versions, each component defined its own interface inline (e.g. <code class="inline-code">FriendsSidebarProps</code>, <code class="inline-code">CodeModalProps</code>, <code class="inline-code">NotesModalProps</code>). By centralizing all 6 prop definitions and shared models (<code class="inline-code">StreakInfo</code>, <code class="inline-code">FriendSubmission</code>) in <code class="inline-code">src/types/index.ts</code>, we enforce a single source of truth across the entire React ecosystem, prevent circular dependencies, and make props reusable across utility layers and test frameworks.
                </div>
            </div>

            <div class="qa-card">
                <div class="question">How Custom Hooks Decouple Business Logic from UI Components</div>
                <div class="answer">
                    1. <strong>useSolvedStatus Hook:</strong> Extracted over 60 lines of complex solved checks and live streak calculation out of <code class="inline-code">ProblemWorkspace.tsx</code>. It queries <code class="inline-code">chrome.storage</code> and <code class="inline-code">fetchUserStatus()</code> in isolation.<br>
                    2. <strong>useFriendsData Hook:</strong> Extracted scraping fallback (<code class="inline-code">fetchFriendsList()</code>) and submission API queries (<code class="inline-code">getFriendsWhoSolved()</code>) from <code class="inline-code">FriendsSidebar.tsx</code>.<br>
                    3. <strong>Separation of Concerns:</strong> Components are now lightweight presentation layers (UI layout and user interactions), while custom hooks encapsulate async state and caching.
                </div>
            </div>
        `
    },

    'universal-notes-portal': {
        title: '🌐 Universal Page-Level Notes Portal Topology',
        content: `
            <div class="qa-card">
                <div class="question">The Problem: Why did Notes Modal open in parallel background tabs?</div>
                <div class="answer">
                    Originally, only <code class="inline-code">ProblemWorkspace.tsx</code> (<code class="inline-code">content.tsx</code>) listened for <code class="inline-code">active_page_note</code> storage changes. According to <code class="inline-code">manifest.json</code>, <code class="inline-code">content.tsx</code> is only injected on problem URLs (<code class="inline-code">/problemset/problem/*</code>).<br><br>
                    If a user clicked "Edit Notes" inside the floating drawer while browsing <code class="inline-code">/profile</code> or <code class="inline-code">/contests</code>, <code class="inline-code">active_page_note</code> was saved to storage, but nothing opened on the active page. Instead, a background tab open to a problem page intercepted the event and opened the dialog there!
                </div>
            </div>

            <div class="qa-card">
                <div class="question">The Solution: Hoisting Storage Listeners to FloatingWorkspace across all URLs</div>
                <div class="answer">
                    1. <strong>Global Injection Layer:</strong> <code class="inline-code">workspace_widget.tsx</code> (<code class="inline-code">FloatingWorkspace.tsx</code>) runs across <code class="inline-code">https://codeforces.com/*</code> (every single Codeforces page).<br>
                    2. <strong>Universal Storage Interceptor:</strong> We moved the <code class="inline-code">active_page_note</code> listener into <code class="inline-code">FloatingWorkspace.tsx</code> and removed it from <code class="inline-code">ProblemWorkspace.tsx</code>.<br>
                    3. <strong>Portal Rendering:</strong> When triggered on any page, <code class="inline-code">FloatingWorkspace</code> closes the FAB drawer and renders <code class="inline-code">&lt;NotesModal /&gt;</code> directly to <code class="inline-code">document.body</code> via <code class="inline-code">createPortal</code>, guaranteeing instantaneous, local modal display without background tab bleed.
                </div>
            </div>
        `
    },

    'sre-rate-limiting': {
        title: '⚡ Rate Limiting & Circuit Breaker Pattern',
        content: `
            <div class="qa-card">
                <div class="question">How do we handle HTTP 429 & Codeforces server throttle?</div>
                <div class="answer">
                    Codeforces limits requests to ~5 calls/sec.<br><br>
                    iPlusFlow uses <strong>Exponential Backoff with Full Jitter</strong> on network calls. If 3 consecutive requests fail, a <strong>Sliding Window Circuit Breaker</strong> trips, serving cached local data for 15 seconds before retrying.
                </div>
            </div>
        `
    },

    'sre-memory-profiling': {
        title: '⚡ Memory Profiling in Content Scripts',
        content: `
            <div class="qa-card">
                <div class="question">Preventing memory leaks during 5+ hour contest sessions</div>
                <div class="answer">
                    1. Detaches event listeners registered on host window on component unmount.<br>
                    2. Uses <code class="inline-code">AbortController</code> to cancel pending fetch requests on tab switches.<br>
                    3. Cleans up injected portal container divs via <code class="inline-code">removeCodeforcesContainers()</code>.
                </div>
            </div>
        `
    },

    'sre-csp-security': {
        title: '⚡ Manifest V3 CSP & Zero-Eval Security Audit',
        content: `
            <div class="qa-card">
                <div class="question">Enforcing Strict Security & Zero-Eval</div>
                <div class="answer">
                    Manifest V3 strictly forbids string execution via <code class="inline-code">eval()</code> or <code class="inline-code">new Function()</code>.<br><br>
                    All extracted submission HTML is sanitized using <code class="inline-code">DOMPurify</code> before DOM insertion to eliminate XSS risks when rendering code from other users.
                </div>
            </div>
        `
    },

    'sre-graceful-degradation': {
        title: '⚡ Offline-First Architecture & Graceful Degradation',
        content: `
            <div class="qa-card">
                <div class="question">What happens when Codeforces servers fail during live contests?</div>
                <div class="answer">
                    All core features (bookmarks, notes, streak history) operate <strong>Offline-First</strong> using local Chrome storage. Sync operations defer automatically until network connectivity is re-established.
                </div>
            </div>
        `
    }
};

function openModal(key) {
  const data = modalDatabase[key];
  if (!data) return;

  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const overlay = document.getElementById('tech-modal-overlay');

  if (titleEl) titleEl.innerHTML = data.title;
  if (bodyEl) bodyEl.innerHTML = data.content;
  if (overlay) {
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal() {
  const overlay = document.getElementById('tech-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

function initModalListeners() {
  const overlay = document.getElementById('tech-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) closeModal();
    });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
}
