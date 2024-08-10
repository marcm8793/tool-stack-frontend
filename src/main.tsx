import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import AppRoutes from "./AppRoutes";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/navbar/theme-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppRoutes />
      </ThemeProvider>
    </Router>
  </StrictMode>
);
