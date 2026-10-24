export interface SeoProps {
  title: string;
  description: string;
  path: string;                     // canonical path, e.g. "/about.html"
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'profile';
  noindex?: boolean;
  nofollow?: boolean;
  alternates?: { hreflang: string; href: string }[];   // includes the page itself
  locale?: string;
  canonical?: boolean;              // false for pages that must not claim a canonical URL (404)
}
