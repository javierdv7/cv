/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

// Best-effort landscape lock (only works inside fullscreen / installed PWA;
// silently no-ops in a regular browser tab — the CSS rotate is the fallback).
if (typeof window !== "undefined" && "orientation" in screen) {
  const so = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> };
  if (so.lock) so.lock("landscape").catch(() => {});
}

const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
