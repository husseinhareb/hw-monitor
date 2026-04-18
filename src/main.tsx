import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { i18nReady } from "./i18n/i18n";
import { useConfigStore } from "./services/configStore";

Promise.all([i18nReady, useConfigStore.getState().hydrate()]).then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
