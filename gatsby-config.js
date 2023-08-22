/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    siteUrl: `https://brave-desert-0d6363e0f.3.azurestaticapps.net`,
    title: `Davi Cruz`,
    description: `Just another security professional's blog.`,
    defaultLocale: `pt-BR`,
    image: `/images/og.png`,
    twitterUsername: `zerahzurc`,
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-transformer-yaml",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: `blog`,
        path: `${__dirname}/content/posts`,
      },
      __key: "posts",
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: `languages`,
        path: `${__dirname}/content/languages`,
      },
      __key: "languages",
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/logo.png",
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
      __key: "images",
    },
    {
      resolve: `gatsby-plugin-mdx`,
      options: {
        mdxOptions: {
          remarkPlugins: [require(`remark-gfm`), require(`remark-gemoji`)],
        },
        gatsbyRemarkPlugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
            },
          },
          `gatsby-remark-prismjs`,
          `@fec/remark-a11y-emoji/gatsby`,
        ],
      },
    },
  ],
};
