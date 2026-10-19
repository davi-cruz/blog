import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV || 'production', process.cwd(), '');
const alphadaviTarget = process.env.ALPHADAVI;

export default defineConfig({
  site: process.env.SITE_URL || env.SITE_URL || 'https://davicruz.com',
  base: '/',
  output: 'static',
  redirects: {
    '/alphadavi': alphadaviTarget,
  },
  i18n: {
    defaultLocale: 'pt-br',
    locales: ['pt-br', 'en', 'es'],
    routing: {
      prefixDefaultLocale: false, // Serves PT-BR at / and EN/ES at /en/ and /es/
    },
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  integrations: [
    expressiveCode({
      themes: ['github-dark', 'github-light'],
      useDarkModeMediaQuery: true,
    }),
    tailwind({
      applyBaseStyles: false,
    }),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'pt-br',
        locales: {
          'pt-br': 'pt-BR',
          en: 'en-US',
          es: 'es-ES',
        },
      },
    }),
  ],
});

