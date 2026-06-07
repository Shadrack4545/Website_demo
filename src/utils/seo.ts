/**
 * SEO Utilities for Meta Tags
 * Provides functions to dynamically update page metadata
 */

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

/**
 * Update document head with meta tags
 * @param metadata SEO metadata object
 */
export function updateSEOMetadata(metadata: SEOMetadata): void {
  // Update title
  document.title = metadata.title;

  // Update or create meta tags
  updateOrCreateMeta('description', metadata.description);
  if (metadata.keywords) {
    updateOrCreateMeta('keywords', metadata.keywords);
  }

  // Open Graph tags
  updateOrCreateMeta('og:title', metadata.ogTitle || metadata.title, 'property');
  updateOrCreateMeta('og:description', metadata.ogDescription || metadata.description, 'property');
  if (metadata.ogImage) {
    updateOrCreateMeta('og:image', metadata.ogImage, 'property');
  }
  if (metadata.ogUrl) {
    updateOrCreateMeta('og:url', metadata.ogUrl, 'property');
  }
  updateOrCreateMeta('og:type', 'website', 'property');

  // Twitter tags
  updateOrCreateMeta('twitter:card', metadata.twitterCard || 'summary_large_image');
  updateOrCreateMeta('twitter:title', metadata.twitterTitle || metadata.title);
  updateOrCreateMeta('twitter:description', metadata.twitterDescription || metadata.description);
  if (metadata.twitterImage) {
    updateOrCreateMeta('twitter:image', metadata.twitterImage);
  }

  // Canonical URL
  if (metadata.canonical) {
    updateOrCreateCanonical(metadata.canonical);
  }
}

/**
 * Helper to update or create meta tags
 */
function updateOrCreateMeta(name: string, content: string, type: 'name' | 'property' = 'name'): void {
  let element = document.querySelector(`meta[${type}="${name}"]`) as HTMLMetaElement;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(type, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

/**
 * Helper to update or create canonical link
 */
function updateOrCreateCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }

  link.href = url;
}

/**
 * Set default SEO metadata for the app
 */
export function setDefaultSEO(): void {
  updateSEOMetadata({
    title: 'African Student Community Platform | Vladivostok State University',
    description:
      'Connect with African students at Vladivostok State University. Join our community for events, resources, networking, and support.',
    keywords:
      'African students, Vladivostok, community, university, networking, events, resources',
    ogTitle: 'African Student Community Platform',
    ogDescription:
      'Connect with African students at Vladivostok State University. Join our vibrant community.',
    ogImage: '/og-image.png',
    ogUrl: 'http://localhost:5176',
    twitterCard: 'summary_large_image',
    twitterTitle: 'African Student Community Platform',
    twitterDescription: 'Connect with African students at Vladivostok State University',
    canonical: 'http://localhost:5176',
  });
}

/**
 * SEO Metadata for different pages
 */
export const PAGE_SEO = {
  landing: {
    title: 'African Student Community | Welcome',
    description:
      'Discover our vibrant African student community at Vladivostok State University. Connect, learn, and grow together.',
    keywords: 'African students, community, Vladivostok, events, networking',
  },
  events: {
    title: 'Events | African Student Community',
    description:
      'Explore upcoming events hosted by the African Student Community at Vladivostok State University.',
    keywords: 'events, community events, Vladivostok, student activities',
  },
  directory: {
    title: 'Community Directory | African Students',
    description:
      'Connect with African students at Vladivostok State University. Browse our community member directory.',
    keywords: 'directory, members, African students, community, networking',
  },
  achievements: {
    title: 'Achievements & Recognition | African Student Community',
    description:
      'Celebrate the achievements and milestones of our African student community members.',
    keywords: 'achievements, recognition, awards, community milestones',
  },
  leadership: {
    title: 'Leadership Team | African Student Community',
    description:
      'Meet the leaders and administrators of the African Student Community at Vladivostok State University.',
    keywords: 'leadership, team, administrators, Vladivostok, community leaders',
  },
  resources: {
    title: 'Resources | African Student Community',
    description:
      'Access shared resources, study materials, and information for African students at Vladivostok State University.',
    keywords: 'resources, materials, study, information, community',
  },
};

/**
 * Generate structured data (JSON-LD) for search engines
 */
export function generateStructuredData(type: 'Organization' | 'Event' | 'LocalBusiness') {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
  };

  switch (type) {
    case 'Organization':
      return {
        ...baseData,
        name: 'African Student Community',
        url: 'http://localhost:5176',
        logo: '/logo.png',
        description:
          'A community for African students at Vladivostok State University to connect, learn, and support each other.',
        sameAs: [
          // Add social media URLs when available
        ],
        contact: {
          '@type': 'ContactPoint',
          contactType: 'Community Support',
          email: 'community@example.com',
        },
      };

    case 'LocalBusiness':
      return {
        ...baseData,
        name: 'African Student Community',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Vladivostok State University',
          addressLocality: 'Vladivostok',
          addressCountry: 'RU',
        },
      };

    case 'Event':
      return {
        ...baseData,
        name: 'Community Event',
        description: 'African Student Community Event',
        startDate: new Date().toISOString(),
        organizer: {
          '@type': 'Organization',
          name: 'African Student Community',
        },
      };

    default:
      return baseData;
  }
}

/**
 * Add structured data to the document
 */
export function addStructuredData(data: object): void {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}
