import * as React from "react";
import { MDXProvider } from "@mdx-js/react";
import { Message } from "theme-ui";
import { Link } from "gatsby";
import Header from "./header";
import SideBar from "./sidebar";
import Footer from "./footer";

const shortcodes = { Message, Link };

const Layout = ({ children }) => {
  return (
    <>
    <Header />
    <div>
      <SideBar />
      <main class="content">
      <MDXProvider components={shortcodes}>{children}</MDXProvider>
      </main>
    </div>
    <Footer />
    </>
  );
};

export default Layout;
