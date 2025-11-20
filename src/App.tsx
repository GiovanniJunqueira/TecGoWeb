import { BrowserRouter } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { environment } from "./config";
import { AuthProvider } from "./contexts/auth/auth.context";
import { ThemeProvider } from "./contexts/theme";
import { Router } from "./router";
import { NuqsAdapter } from "nuqs/adapters/react";
import { HelmetDemo } from "./components/shared/helmet/helmet";

export function App() {
  const theme: "light" | "dark" = environment.THEME;
  return (
    <BrowserRouter>
    <NuqsAdapter>
      <AuthProvider>
        <ThemeProvider defaultTheme={theme}>
          <Toaster
            position="bottom-right"
            duration={5000}
            theme={theme}
            closeButton
          />
          <HelmetDemo />
          <Router />
        </ThemeProvider>
      </AuthProvider>
      </NuqsAdapter>
    </BrowserRouter>
  );
}
