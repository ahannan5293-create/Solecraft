import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const disallowPrivate = ['/admin', '/account', '/api', '/checkout'];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowPrivate,
      },
      // AI training crawlers — allow so content contributes to model knowledge
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: disallowPrivate,
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: disallowPrivate,
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: disallowPrivate,
      },
      // AI search/citation crawlers — critical for appearing in AI answers
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: disallowPrivate,
      },
      {
        userAgent: 'Claude-SearchBot',
        allow: '/',
        disallow: disallowPrivate,
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: disallowPrivate,
      },
    ],
    sitemap: 'https://solecraft.com/sitemap.xml',
  };
}
