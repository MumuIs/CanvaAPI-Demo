import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface PaletteColor {
    backgroundBase?: string;
    backgroundHover?: string;
  }

  interface SimplePaletteColorOptions {
    backgroundBase?: string;
    backgroundHover?: string;
  }
}

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00C4CC", // Canva Teal
    },
    secondary: {
      main: "#7D2AE7", // Canva Purple
      backgroundBase: "rgba(125, 42, 231, 0.16)",
    },
    info: {
      main: "#00C4CC",
    },
    success: {
      main: "#20E5E5", // lighter teal accent
    },
    warning: {
      main: "#FFAE1A",
      light: "#FFC55C",
      backgroundBase: "rgba(255, 174, 26, 0.15)",
      backgroundHover: "rgba(255, 174, 26, 0.25)",
    },
    error: {
      main: "#FF5C80",
    },
    background: {
      default: "#0F0F12", // dark canvas-like
      paper: "#15151A",
    },
    text: {
      primary: "#E6F7F7",
    },
  },
});
