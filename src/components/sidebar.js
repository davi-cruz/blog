import * as React from "react";
import { Grid, Stack, Paper, Typography, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";

const Sidebar = () => {
  const sidebar = {
    title: "About",
    description:
      "Etiam porta sem malesuada magna mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.",
    social: [
      { name: "GitHub", icon: GitHubIcon },
      { name: "Twitter", icon: TwitterIcon },
      { name: "Facebook", icon: FacebookIcon },
    ],
  };

  return (
    <Grid item xs={12} md={4}>
      <Paper elevation={0} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {sidebar.title}
        </Typography>
        <Typography>{sidebar.description}</Typography>
      </Paper>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Social
      </Typography>
      {sidebar.social.map((network) => (
        <Link
          display="block"
          variant="body1"
          href="#"
          key={network.name}
          sx={{ mb: 0.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <network.icon />
            <span>{network.name}</span>
          </Stack>
        </Link>
      ))}
    </Grid>
  );
};

export default Sidebar;
