import * as React from "react";
import Layout from "../components/Layout";
import Link from "../components/Link";
import Seo from "../components/Seo";

const NotFoundPage = () => {
  return (
    <Layout title="404 Not Found">
      <h1>Page not found</h1>
      <Link to="/">return to home</Link>
    </Layout>
  );
};

export default NotFoundPage;

export const Head = () => <Seo title="Not found" />;
