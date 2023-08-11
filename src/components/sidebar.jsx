import * as React from "react";
// import { Link, graphql } from "gatsby";
// import { StaticImage } from "gatsby-plugin-image";

const SideBar = () => {
  // const data = useStaticQuery(graphql`
  //   query {
  //     site {
  //       siteMetadata {
  //         title
  //       }
  //     }
  //   }
  // `);
  return (
    <aside class="sidebar">
    <div class="author-info">
      <img src="author.jpg" alt="Author" />
      <h2>Author Name</h2>
      <p>Short bio about the author...</p>
    </div>
  </aside>
  );
};

export default SideBar;
