import { createTheme } from "@mui/material/styles";

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#097EDB",
    },
    secondary: {
      main: "#A4B031",
    },
    background: {
      default: "#151A24",
      paper: "#252A34",
    },
  },
});

export default theme;
