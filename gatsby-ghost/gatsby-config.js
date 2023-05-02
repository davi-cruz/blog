/* eslint-disable semi */
/* eslint-disable no-unsafe-finally */
/* eslint-disable no-restricted-syntax */
const path = require(`path`);

const config = require(`./src/utils/siteConfig`);
const generateRSSFeed = require(`./src/utils/rss/generate-feed`);

/**
 * This is the place where you can tell Gatsby which plugins to use
 * and set them up the way you want.
 *
 * Further info 👉🏼 https://www.gatsbyjs.org/docs/gatsby-config/
 *
 */
module.exports = {
    siteMetadata: {
        siteUrl: process.env.SITEURL || config.siteUrl,
    },
    trailingSlash: 'always',
    plugins: [
        /**
         *  Content Plugins
         */
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: path.join(__dirname, `src`, `pages`),
                name: `pages`,
            },
        },
        // Setup for optimised images.
        // See https://www.gatsbyjs.org/packages/gatsby-image/
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: path.join(__dirname, `src`, `images`),
                name: `images`,
            },
        },
        `gatsby-plugin-image`,
        `gatsby-plugin-sharp`,
        `gatsby-transformer-sharp`,
        // {
        //     resolve: `gatsby-plugin-feed`,
        //     options: {
        //         query: `
        //         {
        //             allGhostSettings {
        //                 edges {
        //                     node {
        //                         title
        //                         description
        //                     }
        //                 }
        //             }
        //         }
        //       `,
        //         feeds: [generateRSSFeed(config)],
        //     },
        // },
        // {
        //     resolve: `gatsby-plugin-advanced-sitemap`,
        //     options: {
        //         query: `
        //         {
        //             allGhostPost {
        //                 edges {
        //                     node {
        //                         id
        //                         slug
        //                         updated_at
        //                         created_at
        //                         feature_image
        //                     }
        //                 }
        //             }
        //             allGhostPage {
        //                 edges {
        //                     node {
        //                         id
        //                         slug
        //                         updated_at
        //                         created_at
        //                         feature_image
        //                     }
        //                 }
        //             }
        //             allGhostTag {
        //                 edges {
        //                     node {
        //                         id
        //                         slug
        //                         feature_image
        //                     }
        //                 }
        //             }
        //             allGhostAuthor {
        //                 edges {
        //                     node {
        //                         id
        //                         slug
        //                         profile_image
        //                     }
        //                 }
        //             }
        //         }`,
        //         mapping: {
        //             allGhostPost: {
        //                 sitemap: `posts`,
        //             },
        //             allGhostTag: {
        //                 sitemap: `tags`,
        //             },
        //             allGhostAuthor: {
        //                 sitemap: `authors`,
        //             },
        //             allGhostPage: {
        //                 sitemap: `pages`,
        //             },
        //         },
        //         exclude: [
        //             `/dev-404-page`,
        //             `/404`,
        //             `/404.html`,
        //             `/offline-plugin-app-shell-fallback`,
        //         ],
        //         createLinkInHead: true,
        //         addUncaughtPages: true,
        //     },
        // },
        `gatsby-plugin-catch-links`,
        `gatsby-plugin-react-helmet`,
        `gatsby-plugin-offline`,
    ],
};
