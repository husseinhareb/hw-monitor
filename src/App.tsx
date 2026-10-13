import React, { useEffect } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import Navbar from "./components/Navbar/Navbar";
import { useSetPaused } from "./services/store";
import ErrorBoundary from "./components/Misc/ErrorBoundary";
import Toast from "./components/Misc/Toast";
import { useConfigStore } from "./services/configStore";
const App: React.FC = () => {
  const setPaused = useSetPaused();
  const uiFont = useConfigStore((state) => state.config.ui_font_family);
  const uiScale = useConfigStore((state) => state.config.ui_scale);
  const hydrate = useConfigStore((state) => state.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Empty keeps the bundled font from App.css; the value is a CSS font-family list
  useEffect(() => {
    document.documentElement.style.setProperty("--ui-font", uiFont.trim() || null);
  }, [uiFont]);

  // Webview zoom scales text together with the boxes around it, so hardcoded layouts don't overflow
  useEffect(() => {
    // Wrapped so a missing Tauri runtime (plain browser) rejects instead of throwing during render
    Promise.resolve().then(() => getCurrentWebview().setZoom(uiScale / 100)).catch((error) => {
      console.error("Error applying UI scale:", error);
    });
  }, [uiScale]);

  useEffect(() => {
    const onVisibilityChange = () => {
      setPaused(document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [setPaused]);

  return (
    <ErrorBoundary>
      <div className="app">
        <Navbar />
      </div>
      <Toast />
    </ErrorBoundary>
  );
}

export default App;
