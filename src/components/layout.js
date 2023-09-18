import * as React from "react";
import { CssBaseline, Grid, Container, Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import Message from "./Message";
import Link from "../components/Link";
import { MDXProvider } from "@mdx-js/react";
const shortcodes = { Link, Message };

const Layout = ({ title, children }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="Blog" />
        <main>
          <Grid container spacing={5} sx={{ mt: 3 }}>
            <Grid
              item
              xs={12}
              md={8}
              sx={{
                "& .markdown": {
                  py: 3,
                },
              }}
            >
              <Typography variant="h4" component="h1" gutterBottom>
                {title}
              </Typography>
              <MDXProvider components={shortcodes}>{children}</MDXProvider>
            </Grid>
            <Sidebar />
          </Grid>
        </main>
      </Container>
      <Footer />
    </ThemeProvider>
  );
};

export default Layout;
