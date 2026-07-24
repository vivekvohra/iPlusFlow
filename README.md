<p align="center">
  <img width="128" height="128" alt="iPlusFlow Logo" src="https://github.com/user-attachments/assets/a1c24266-4591-4db3-850c-99ff2cbbbade" />
</p>

<h1 align="center">iPlusFlow for Codeforces</h1>

<p align="center">
  <b>Problem Tracking, Peer Learning &amp; Universal Notes for Competitive Programmers</b>
</p>

<p align="center">
  <a href="https://chromewebstore.google.com/detail/iplusflow-for-codeforces/dldgiedjpmpfakogeeipicafjngnefej?utm_source=item-share-cb">
    <img src="https://img.shields.io/badge/Chrome%20Web%20Store-Install%20Extension-blue?style=for-the-badge&logo=googlechrome" alt="Chrome Web Store" />
  </a>
  <a href="https://docs.iplusflow.com/iplusflow">
    <img src="https://img.shields.io/badge/Live%20Docs-docs.iplusflow.com-003399?style=for-the-badge&logo=storybook" alt="Live Documentation" />
  </a>
  <a href="https://youtu.be/4-LmzPdpG1Q">
    <img src="https://img.shields.io/badge/YouTube-Watch%20Demo-red?style=for-the-badge&logo=youtube" alt="Watch Demo Video" />
  </a>
</p>

---

## 💡 About iPlusFlow

**iPlusFlow** is a powerful Chrome extension built with React 19, TypeScript, and Manifest V3. It enhances your Codeforces practice environment by integrating peer solution inspection, universal markdown notes, automatic solve tracking, and daily streak analytics — all inside a isolated, zero-leakage Closed Shadow DOM sandbox.

🌐 **Live System Architecture & Interactive Manual:** [docs.iplusflow.com/iplusflow](https://docs.iplusflow.com/iplusflow)

---

## 🚀 Key Features

- 👥 **Friends' Solution Inspector**: Inspect accepted solutions from up to 20 friends directly on problem pages without leaving your active tab. Uses high-speed parallel scraping with `DOMParser` (<300ms snippet extraction).
- ✅ **Automatic Solved Sync & Daily Streaks**: Tracks your solved problem history via official Codeforces REST APIs and calculates active & longest solve streaks with instant badge updates across tabs.
- 📌 **Problem Bookmarks & Filter Engine**: Bookmark problem statements, filter by rating range (e.g. 800–3500), problem tags, or unsolved status in a sleek sidebar overlay.
- ✍️ **Universal Notes Portal**: Write rich notes attached to specific problem pages or Codeforces URLs, synchronized across desktop and mobile Chrome instances.
- 🛡️ **Closed Shadow DOM Isolation**: 100% style and DOM sandbox encapsulation ensuring zero CSS pollution or layout shift on legacy Codeforces tables.
- ☁️ **Chrome Storage Sync**: Native sync storage with local caching to maintain fast load times while respecting Codeforces rate limits.

---

## 🎥 Video Demo

Watch **iPlusFlow** in action to see problem bookmarking, streak tracking, universal notes, and friends' code inspection:

[![iPlusFlow Demo Video](https://img.youtube.com/vi/4-LmzPdpG1Q/maxresdefault.jpg)](https://youtu.be/4-LmzPdpG1Q)

▶️ **[Click here to watch the full HD Demo Video on YouTube](https://youtu.be/4-LmzPdpG1Q)**

---

## 📸 Screenshots & UI Showcase

<br>
<p align="center">
  <img width="1280" height="800" alt="SS1" src="https://github.com/user-attachments/assets/12cda6a3-d207-4990-8564-48a0972d3eac" />
  
  <br>

</p>

<br>
<p align="center">
  
  <img width="1280" height="800" alt="ss2" src="https://github.com/user-attachments/assets/bcd1209a-cd6d-4ed7-ae61-2f3672c0d37c" />
  
  
  <br>

</p>

<br>
<p align="center">
  <img width="1280" height="800" alt="ss3" src="https://github.com/user-attachments/assets/1d18c07e-a517-4fc5-bef1-7db932be8e22" />

  <br>

</p>

<br>
<p align="center">
  <img width="1280" height="800" alt="ss4" src="https://github.com/user-attachments/assets/4feed89b-17e2-430f-a3bb-8dc211621974" />


  <br>

</p>




---

## 📚 System Architecture & Documentation

For a deep dive into the engineering design, component responsibility matrix, Manifest V3 background worker architecture, and interactive simulators:

📖 **Explore the Interactive Documentation**: [https://docs.iplusflow.com/iplusflow](https://docs.iplusflow.com/iplusflow)

---

## 🧩 Installation

### Option 1: Chrome Web Store (Recommended)
🛒 **[Install iPlusFlow from Chrome Web Store](https://chromewebstore.google.com/detail/iplusflow-for-codeforces/dldgiedjpmpfakogeeipicafjngnefej?utm_source=item-share-cb)**

### Option 2: Developer Installation (From Source)
1. Clone this repository:
   ```bash
   git clone https://github.com/vivekvohra/iPlusFlow.git
   cd iPlusFlow/iplusflow_codeforces
   ```
2. Install dependencies & build:
   ```bash
   npm install
   npm run build
   ```
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select the `dist/` directory generated in `iplusflow_codeforces`.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Extension Spec**: Chrome Extension Manifest V3
- **Styling & Sandbox**: Closed Shadow DOM (`ShadowRoot`) + Custom CSS Design System
- **API Sync**: Codeforces Official REST API (`user.status`, `contest.status`)
- **Storage**: `chrome.storage.sync` & `chrome.storage.local`

---

## 🔐 Privacy & Security

iPlusFlow is **100% privacy-first**. All bookmarks, notes, and preferences remain local or synchronized securely within your personal Google Chrome account (`chrome.storage.sync`). No tracking analytics or third-party backend servers are used.

📄 **Privacy Policy**: [docs.iplusflow.com/iplusflow/privacy.html](https://docs.iplusflow.com/iplusflow/privacy.html)

---

## 🤝 Contributing & Feedback

Feel free to open issues or submit pull requests on the [GitHub Repository](https://github.com/vivekvohra/iPlusFlow)!
