import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import "./index.css";
import "./i18n";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

// Register service worker for PWA
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      // Check for updates every 30 minutes
      setInterval(() => reg.update(), 30 * 60 * 1000);
    }).catch(() => {});
  });

  // Listen for SW sync messages
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "SYNC_FLUSH") {
      // Trigger pending analytics flush when back online
      import("./lib/vitrine-sync").then((mod) => {
        if (typeof mod.flushSync === "function") mod.flushSync();
      }).catch(() => {});
    }
  });
}
