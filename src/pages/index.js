import * as React from "react";
import HomePage from "../components/HomePage";
import Seo from "../components/Seo"

const IndexPage = () => {
  return (
    <HomePage type="main"/>
  );
};

export default IndexPage;

export const Head = () => <Seo title="Home" />;