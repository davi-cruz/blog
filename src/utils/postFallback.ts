import { getCollection, type CollectionEntry } from 'astro:content';
import { type Lang } from '../i18n/ui';

export interface AvailableVersion {
  lang: Lang;
  title: string;
  url: string;
}

export interface FallbackInfo {
  requestedLang: Lang;
  fallbackPostLang: Lang;
  availableVersions: AvailableVersion[];
}

export interface PostRoute {
  slug: string;
  post: CollectionEntry<'blog'>;
  lang: Lang;
  fallbackInfo: FallbackInfo | null;
  prevPost: CollectionEntry<'blog'> | null;
  nextPost: CollectionEntry<'blog'> | null;
}

export const FALLBACK_PRIORITY: Lang[] = ['en', 'pt-br', 'es'];

export function getCleanSlug(post: CollectionEntry<'blog'>): string {
  return post.slug.split('/').slice(1).join('/');
}

export function getPostUrl(lang: Lang, cleanSlug: string): string {
  return lang === 'pt-br' ? `/${cleanSlug}` : `/${lang}/${cleanSlug}`;
}

export async function getPostRoutesForLang(lang: Lang): Promise<PostRoute[]> {
  const allPosts = await getCollection('blog', ({ data }) => !data.draft);

  // Group all posts by translationId
  const groups = new Map<string, CollectionEntry<'blog'>[]>();
  for (const post of allPosts) {
    const tId = post.data.translationId || getCleanSlug(post);
    if (!groups.has(tId)) {
      groups.set(tId, []);
    }
    groups.get(tId)!.push(post);
  }

  // Native posts in this language sorted by pubDate descending
  const nativePosts = allPosts
    .filter((p) => p.slug.startsWith(`${lang}/`))
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const routes: PostRoute[] = [];
  const seenSlugs = new Set<string>();

  // 1. Native posts in order with prev/next navigation
  for (let i = 0; i < nativePosts.length; i++) {
    const post = nativePosts[i];
    const cleanSlug = getCleanSlug(post);
    seenSlugs.add(cleanSlug);

    const prevPost = i < nativePosts.length - 1 ? nativePosts[i + 1] : null;
    const nextPost = i > 0 ? nativePosts[i - 1] : null;

    routes.push({
      slug: cleanSlug,
      post,
      lang,
      fallbackInfo: null,
      prevPost,
      nextPost,
    });
  }

  // 2. Fallbacks for posts not yet translated into this language
  const fallbackOrder = FALLBACK_PRIORITY.filter((l) => l !== lang);

  for (const [_tId, group] of groups.entries()) {
    const hasNative = group.some((p) => p.slug.startsWith(`${lang}/`));
    if (hasNative) continue;

    // Find best fallback post according to priority: EN -> PT-BR -> ES
    let fallbackPost: CollectionEntry<'blog'> | undefined;
    for (const fl of fallbackOrder) {
      fallbackPost = group.find((p) => p.slug.startsWith(`${fl}/`));
      if (fallbackPost) break;
    }

    if (!fallbackPost) continue;

    const fallbackLang = fallbackPost.slug.split('/')[0] as Lang;

    // Available versions across all existing translations
    const availableVersions: AvailableVersion[] = group.map((p) => {
      const pLang = p.slug.split('/')[0] as Lang;
      const pSlug = getCleanSlug(p);
      return {
        lang: pLang,
        title: p.data.title,
        url: getPostUrl(pLang, pSlug),
      };
    });

    const fallbackInfo: FallbackInfo = {
      requestedLang: lang,
      fallbackPostLang: fallbackLang,
      availableVersions,
    };

    // Slugs to register for this route
    const slugsToRegister = new Set<string>([getCleanSlug(fallbackPost)]);
    for (const p of group) {
      slugsToRegister.add(getCleanSlug(p));
    }

    for (const s of slugsToRegister) {
      if (!seenSlugs.has(s)) {
        seenSlugs.add(s);
        routes.push({
          slug: s,
          post: fallbackPost,
          lang,
          fallbackInfo,
          prevPost: null,
          nextPost: null,
        });
      }
    }
  }

  return routes;
}

