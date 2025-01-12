import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import AppRoutes from "./AppRoutes";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/navbar/theme-provider";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

// Only initialize PostHog in production
if (import.meta.env.PROD) {
  posthog.init(import.meta.env.VITE_POSTHOG_API_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_UI_HOST,
    ui_host: import.meta.env.VITE_POSTHOG_HOST,
  });
}

if (import.meta.env.PROD) {
  console.log("Production mode!");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Conditionally render PostHogProvider only in production */}
    {import.meta.env.PROD ? (
      <PostHogProvider client={posthog}>
        <Router>
          <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <AppRoutes />
            <Toaster />
          </ThemeProvider>
        </Router>
      </PostHogProvider>
    ) : (
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AppRoutes />
          <Toaster />
        </ThemeProvider>
      </Router>
    )}
  </StrictMode>
);
