import { BrowserRouter } from "react-router-dom";
import { Router } from "./router";
import { ThemeProvider } from "./contexts/theme";
import { environment } from "./config";

export function App() {
  const theme: "light" | "dark" = environment.THEME;
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme={theme}>
        <Router />
      </ThemeProvider>
    </BrowserRouter>
  );
}
