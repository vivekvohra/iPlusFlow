import { createRoot } from "react-dom/client";
import FloatingWorkspace from "./components/FloatingWorkspace";

interface HTMLRootElement extends HTMLDivElement {
  _reactRoot?: any;
}

const initWidget = () => {
  let newDiv = document.getElementById("iplus-root") as HTMLRootElement | null;
  if (!newDiv) {
    newDiv = document.createElement("div") as HTMLRootElement;
    newDiv.id = "iplus-root";
    document.body.appendChild(newDiv);
  }

  let reactRoot = newDiv._reactRoot;
  if (!reactRoot) {
    reactRoot = createRoot(newDiv);
    newDiv._reactRoot = reactRoot;
  }
  reactRoot.render(<FloatingWorkspace />);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWidget);
} else {
  initWidget();
}
