"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  typography: {
    h4: {
      fontSize: {
        xs: "1.75rem",
        sm: "2rem",
        md: "2.5rem",
      },
    },
    h6: {
      fontSize: {
        xs: "0.95rem",
        sm: "1rem",
        md: "1.1rem",
      },
    },
    body1: {
      fontSize: {
        xs: "0.9rem",
        sm: "0.95rem",
        md: "1rem",
      },
    },
  },
});

export function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
