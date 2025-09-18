import { MetadataRoute } from 'next';
import { BLOG_POSTS, NAV_LINKS, PROGRAMS } from '@/lib/constants';

const BASE_URL = 'https://yayehalimatousaadiya.com/';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = NAV_LINKS.map((link) => ({
    url: `${BASE_URL}${link.href.substring(1)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: link.href === '/' ? 1 : 0.8,
  }));

  const blogPosts = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}actualites/${post.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const programPages = PROGRAMS.map((program) => ({
    url: `${BASE_URL}programmes/${program.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPosts, ...programPages];
}
