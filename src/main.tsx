import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { HotkeyProvider } from "./HotkeyProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HotkeyProvider>
      <App />
    </HotkeyProvider>
  </StrictMode>
);
