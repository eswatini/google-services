import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0E7C7B" }, // teal-green
    secondary: { main: "#2E86AB" },
    success: { main: "#2E7D32" },
    error: { main: "#C62828" },
    warning: { main: "#ED6C02" },
    info: { main: "#1565C0" },
    background: { default: "#FAFAFA", paper: "#FFFFFF" },
    text: { primary: "#1A1A1A", secondary: "#37474F" },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none" },
  },
  components: {
    MuiButton: { defaultProps: { variant: "contained" } },
  },
});