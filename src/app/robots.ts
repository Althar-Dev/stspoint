import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/console/',
        '/dev/',
        '/client/',
        '/api/',
        '/checkout/',
      ],
    },
    sitemap: 'https://stspoint.id/sitemap.xml',
  };
}
