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
    mode: "light",
    primary: {
      main: "#00C4CC",
    },
    secondary: {
      main: "#7D2AE7",
      backgroundBase: "rgba(125, 42, 231, 0.08)",
    },
    info: {
      main: "#00C4CC",
    },
    success: {
      main: "#12B886",
    },
    warning: {
      main: "#FFAE1A",
      light: "#FFC55C",
      backgroundBase: "rgba(255, 174, 26, 0.12)",
      backgroundHover: "rgba(255, 174, 26, 0.2)",
    },
    error: {
      main: "#E03131",
    },
    background: {
      default: "#FFFFFF",
      paper: "#F7FAFC",
    },
    text: {
      primary: "#0F172A",
    },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiAppBar: { styleOverrides: { root: { boxShadow: "none", borderBottom: "1px solid #EDF2F7" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiContainer: { styleOverrides: { root: { paddingLeft: 16, paddingRight: 16 } } },
  },
});
