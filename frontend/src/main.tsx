import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./contexts/ThemeContext"; // ✅ Import the ThemeProvider

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* ✅ Wrap the entire app inside ThemeProvider */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
