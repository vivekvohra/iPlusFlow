import { createRoot } from "react-dom/client";

import ProblemWorkspace from "./components/ProblemWorkspace"; 

// Problem-specific content script
// Runs only on Codeforces problem pages (e.g. /contest/*/problem/*, /problemset/problem/*)
const initProblemPage = () => {
  console.log("iPlusFlow: Problem page script loaded.");

  // 1. Create the host element and append to Codeforces body
  const newDiv = document.createElement("div");
  newDiv.id = "iplus-problem-root"; 
  
  // Keep it fixed/floating so it doesn't mess up Codeforces' native layout
  newDiv.style.position = "fixed";
  newDiv.style.zIndex = "9999";
  document.body.appendChild(newDiv);

  // 2. Attach the Shadow DOM 
  const shadow = newDiv.attachShadow({ mode: "open" });

  // 3. Create the inner container that React will actually use
  const reactRootContainer = document.createElement("div");
  reactRootContainer.id = "react-root";
  shadow.appendChild(reactRootContainer);

  // 4. Wake up React inside the Shadow DOM!
  const root = createRoot(reactRootContainer);
  root.render(<ProblemWorkspace />);
};

// Wait for the Codeforces page to be fully parsed before injecting
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProblemPage);
} else {
  initProblemPage();
}