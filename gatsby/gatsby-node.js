const path = require(`path`);
// Log out information after a build is done
exports.onPostBuild = ({ reporter }) => {
  reporter.info(`Your Gatsby site has been built!`);
};
// Create blog pages dynamically
exports.createPages = async ({ graphql, actions }) => {
  const defaultLocale = "pt-BR";
  const { createPage } = actions;
  const blogPostTemplate = path.resolve(`./src/pages/blog/blog-post.js`);
  const result = await graphql(`
    query BlogPosts {
      allMdx {
        edges {
          node {
            frontmatter {
              slug
              title
              locale
              category
            }
          }
        }
      }
    }
  `);
  result.data.allMdx.edges.forEach((edge) => {
    const locale =
      edge.node.frontmatter.locale === defaultLocale
        ? ""
        : `${edge.node.frontmatter.locale}/`;
    createPage({
      path: `/${locale}${edge.node.frontmatter.category}/${edge.node.frontmatter.slug}`,
      component: blogPostTemplate,
      context: {
        title: edge.node.frontmatter.title,
      },
    });
  });
};
