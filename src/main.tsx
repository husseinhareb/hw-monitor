import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import { i18nReady } from "./i18n/i18n";

i18nReady.then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
