/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    siteUrl: `https://davicruz.com`,
    title: "Davi Cruz",
    locales: ["en-US", "pt-BR"],
    defaultLocale: "pt-BR",
    seoAndPwaNodes: [
      {
        locale: "pt-BR",
        siteName: "Davi Cruz Blog",
        separator: "—",
        fallbackDescription:
          "Apenas mais um blog de profissional de cibersegurança",
        defaultOgImage: {
          url: "https://www.datocms-assets.com/63095/1627923110-default-og-image.jpg?auto=format",
        },
        pwaThemeColor: {
          themeHexColor: "#0067fa",
        },
      },
      {
        locale: "en-US",
        siteName: "Davi Cruz Blog",
        separator: "—",
        fallbackDescription: "Just another cybersecurity professional blog",
        defaultOgImage: {
          url: "https://www.datocms-assets.com/63095/1627923110-default-og-image.jpg?auto=format",
        },
        pwaThemeColor: {
          themeHexColor: "#0067fa",
        },
      },
    ],
    blogRootNodes: [
      {
        slug: "blog",
        locale: "en-US"
      },
      {
        slug: "blog",
        locale: "pt-BR"
      }
    ],
    textStringNodes: [
      {
        locale: "en-US",
        backToBlogAriaLabel: "Back to blog"
      },
      {
          locale: "pt-BR",
          backToBlogAriaLabel: "Voltar para o blog"
      },
    ]
  },
  plugins: [
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: `blog`,
        path: `${__dirname}/blog`,
      },
    },
    "gatsby-plugin-mdx",
    "gatsby-transformer-sharp",
  ],
};
