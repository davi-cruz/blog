import * as React from "react";
import { CssBaseline, Grid, Container, Typography } from "@mui/material";
import theme from "../theme";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./Header";
import MainFeaturedPost from "./MainFeaturedPost";
import FeaturedPost from "./FeaturedPost";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const HomePage = ({ type, title, children }) => {
  const featuredPosts = [
    {
      title: "Title of a longer featured blog post",
      date: "Nov 15",
      description:
        "Multiple lines of text that form the lede, informing new readers quickly and efficiently about what's most interesting in this post's contents.",
      image: "https://source.unsplash.com/random?wallpapers",
      imageText: "main image description",
      slug: "my-last-post",
    },
    {
      title: "Yet another post",
      date: "Nov 14",
      description:
        "This is a wider card with supporting text below as a natural lead-in to additional content.",
      image: "https://source.unsplash.com/random?wallpapers",
      imageText: "Image Text",
      slug: "yet-another-post",
    },
    {
      title: "Another post",
      date: "Nov 13",
      description:
        "This is a wider card with supporting text below as a natural lead-in to additional content.",
      image: "https://source.unsplash.com/random?wallpapers",
      imageText: "Image Text",
      slug: "another-post",
    },
    {
      title: "My second post",
      date: "Nov 12",
      description:
        "This is a wider card with supporting text below as a natural lead-in to additional content.",
      image: "https://source.unsplash.com/random?wallpapers",
      imageText: "Image Text",
      slug: "my-second-post",
    },
    {
      title: "My first post",
      date: "Nov 11",
      description:
        "This is a wider card with supporting text below as a natural lead-in to additional content.",
      image: "https://source.unsplash.com/random?wallpapers",
      imageText: "Image Text",
      slug: "my-first-post",
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title="Blog" />
        <main>
          {type === "main" ? (
            <>
              <MainFeaturedPost post={featuredPosts[0]} />
              <Grid container spacing={4}>
                {featuredPosts.slice(1 - 7).map((post) => (
                  <FeaturedPost key={post.title} post={post} />
                ))}
              </Grid>
            </>
          ) : (
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
                {children}
              </Grid>
              <Sidebar />
            </Grid>
          )}
        </main>
      </Container>
      <Footer />
    </ThemeProvider>
  );
};

export default HomePage;
