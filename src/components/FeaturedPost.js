import * as React from "react";
import {
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
} from "@mui/material";

const FeaturedPost = ({ post }) => {
  return (
    <Grid item xs={12} md={6}>
      <CardActionArea component="a" href="#">
        <Card sx={{ display: "flex" }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography component="h2" variant="h5">
              {post.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {post.date}
            </Typography>
            <Typography variant="subtitle1" paragraph>
              {post.description}
            </Typography>
            <Typography variant="subtitle1" color="primary">
              Continue reading...
            </Typography>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: 160, display: { xs: "none", sm: "block" } }}
            image={post.image}
            alt={post.imageText}
          />
        </Card>
      </CardActionArea>
    </Grid>
  );
};

export default FeaturedPost;
