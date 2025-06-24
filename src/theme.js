import { createTheme } from "@mui/material/styles";

// Define your custom theme here
const theme = createTheme({
  palette: {
    mode: "light", // change to "dark" for dark mode
    primary: {
      main: "#1976d2", // Blue
    },
    secondary: {
      main: "#9c27b0", // Purple
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: ["Roboto", "sans-serif"].join(","),
    fontSize: 14,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

export default theme;
