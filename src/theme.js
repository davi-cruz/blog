import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2196f3",
    },
    secondary: {
      main: "#00695c",
    },
    background: {
      default: "#121212",
      paper: "#121212",
    },
  },
});

export default theme;
