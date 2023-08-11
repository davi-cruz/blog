import * as React from "react";
import { Link, graphql } from "gatsby";
import { StaticImage } from "gatsby-plugin-image";

const Header = () => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  return (
    <header>
      <nav>
        <div class="logo">
          <Link to="/">
            <StaticImage src="../images/logo.png" alt="logo" />
            {data.site.siteMetadata.title}
          </Link>
        </div>
        <ul class="nav-links">
          <li>
            <Link to="#">Home</Link>
          </li>
          <li>
            <Link to="#">Blog</Link>
          </li>
          <li>
            <Link to="#">About</Link>
          </li>
          <li>
            <Link to="#">Contact</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
