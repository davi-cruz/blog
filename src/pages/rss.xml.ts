import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const sortedPosts = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const site = context.site?.toString() || import.meta.env.SITE_URL || 'https://davicruz.com';

  return rss({
    title: 'Davi Cruz | Technical Blog',
    description: 'Technical blog covering cybersecurity, ethical hacking, cloud security, and Linux administration.',
    site,
    items: sortedPosts.map((post) => {
      const [lang, ...slugParts] = post.slug.split('/');
      const slug = slugParts.join('/');
      const link = lang === 'pt-br' ? `/${slug}` : `/${lang}/${slug}`;

      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link,
      };
    }),
    customData: `<language>pt-br</language>`,
  });
}

