import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://popcorn-creator.com'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/', '/profile/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
