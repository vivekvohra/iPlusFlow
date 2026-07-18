// Problem-specific content script
// Runs only on Codeforces problem pages (e.g. /contest/*/problem/*, /problemset/problem/*)
// You can add any problem-specific DOM manipulations or helpers here without conflicting with the floating widget.

const initProblemPage = () => {
  // Problem-specific setup (code syntax prettify, problem data extraction, etc.)
  console.log("iPlusFlow: Problem page script loaded.");
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProblemPage);
} else {
  initProblemPage();
}


