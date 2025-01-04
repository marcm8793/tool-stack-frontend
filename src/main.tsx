import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import AppRoutes from "./AppRoutes";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/navbar/theme-provider";
import { PostHogProvider } from "posthog-js/react";

const options = {
  api_host: process.env.REACT_APP_PUBLIC_POSTHOG_HOST,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={process.env.REACT_APP_PUBLIC_POSTHOG_KEY}
      options={options}
    >
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AppRoutes />
          <Toaster />
        </ThemeProvider>
      </Router>
    </PostHogProvider>
  </StrictMode>
);
