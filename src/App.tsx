import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import { ThemeProvider } from "./contexts/theme";
import { environment } from "./config";
import { Toaster } from "./components/ui/sonner";

export function App() {
  const theme: "light" | "dark" = environment.THEME;
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme={theme}>
        <Toaster
          position="bottom-right"
          duration={5000}
          theme={theme}
          closeButton
        />
        <Router />
      </ThemeProvider>
    </BrowserRouter>
  );
}
