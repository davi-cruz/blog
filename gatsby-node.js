const { createRemoteFileNode } = require("gatsby-source-filesystem");

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type Mdx implements Node {
      frontmatter: Frontmatter
      featuredImage: File @link(from: "fields.localFile")
    }

    type Frontmatter {
      title: String!
      featuredImage: String
    }
  `);
};

exports.onCreateNode = async ({
  node,
  actions: { createNode, createNodeField },
  createNodeId,
  getCache,
}) => {
  // For all Mdx nodes that have a featured image url, call createRemoteFileNode
  if (node.internal.type === "Mdx" && node.frontmatter.featuredImage !== null) {
    const fileNode = await createRemoteFileNode({
      url: node.frontmatter.featuredImage,
      parentNodeId: node.id,
      createNode,
      createNodeId,
      getCache,
    });

    if (fileNode) {
      createNodeField({ node, name: "localFile", value: fileNode.id });
    }
  }
};

// TinaCMS Admin
const express = require("express");
exports.onCreateDevServer = ({ app }) => {
  app.use("/admin", express.static("public/admin"));
};
