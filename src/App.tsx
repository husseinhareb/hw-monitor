import React, { useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import { useSetPaused } from "./services/store";
import ErrorBoundary from "./components/Misc/ErrorBoundary";
import Toast from "./components/Misc/Toast";
import './i18n/i18n'; 
const App: React.FC = () => {
  const setPaused = useSetPaused();

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
