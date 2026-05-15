import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/shopkeeper/'],
    },
    sitemap: 'https://your-domain.com/sitemap.xml',
  }
}
