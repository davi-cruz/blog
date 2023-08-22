import * as React from "react";
import { Box, Container, Typography, Paper } from "@mui/material";
import MuiLink from "@mui/material/Link";

const Footer = () => {
  return (
    <Paper
      sx={{
        marginTop: "calc(10% + 60px)",
        width: "100%",
        position: "fixed",
        bottom: 0,
      }}
      component="footer"
      square
      variant="outlined"
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: "flex",
            my: 1,
          }}
        >
          <div>
            {/* <Image
              priority
              src="../images/logo.png"
              width={75}
              height={30}
              alt="Logo"
            /> */}
          </div>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "center",
            display: "flex",
            mb: 2,
          }}
        >
          <Typography variant="caption">
            {"Copyright © "}
            <MuiLink color="inherit" href="/">
              Davi Cruz
            </MuiLink>{" "}
            {new Date().getFullYear()}
            {"."}
          </Typography>
        </Box>
      </Container>
    </Paper>
  );
};

export default Footer;
