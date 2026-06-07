/**
 * Sitemap Generator for SEO
 * Generates XML sitemap for search engines
 */

export interface SitemapEntry {
  url: string;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number; // 0.0 to 1.0
}

/**
 * Generate XML sitemap for search engines
 */
export function generateSitemap(entries: SitemapEntry[]): string {
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const sitemapHeader = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  const sitemapFooter = '</urlset>';

  const urls = entries
    .map((entry) => {
      return `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString().split('T')[0]}</lastmod>` : ''}
    ${entry.changeFrequency ? `<changefreq>${entry.changeFrequency}</changefreq>` : ''}
    ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
    })
    .join('\n');

  return `${xmlHeader}\n<${sitemapHeader}${urls}\n${sitemapFooter}`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get default sitemap entries for the platform
 */
export function getDefaultSitemapEntries(): SitemapEntry[] {
  const baseUrl = 'http://localhost:5176';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/events`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/announcements`,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/directory`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/leadership`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/achievements`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resources`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `# Robots.txt for African Student Community Platform
# Generated for SEO optimization

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

# Specific rules for search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Sitemap location
Sitemap: http://localhost:5176/sitemap.xml
`;
}

/**
 * Generate a breadcrumb schema for structured data
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQSchema for structured data
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
