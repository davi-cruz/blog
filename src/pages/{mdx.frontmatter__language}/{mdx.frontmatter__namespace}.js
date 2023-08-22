import * as React from "react";
import { graphql } from "gatsby";
// import { GatsbyImage, getImage } from "gatsby-plugin-image";
// import {Paper} from "@mui/material";
import Layout from "../../components/Layout";
import Seo from "../../components/Seo";

const BlogPost = ({ data, children }) => {
  // const image = getImage(
  //   data.mdx.featuredImage.childImageSharp.gatsbyImageData
  // );
  return (
    <Layout title={data.mdx.frontmatter.title}>
      <p>Posted: {data.mdx.frontmatter.date}</p>
      {/* <GatsbyImage image={image} alt={data.mdx.frontmatter.title} /> */}
      {children}
    </Layout>
  );
};

export const query = graphql`
  query ($id: String) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        date(formatString: "MMMM D, YYYY")
      }
      featuredImage {
        childImageSharp {
          gatsbyImageData
        }
      }
    }
  }
`;

export const Head = ({ data }) => <Seo title={data.mdx.frontmatter.title} />;

export default BlogPost;
