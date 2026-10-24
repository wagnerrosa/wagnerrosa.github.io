import type { APIRoute } from 'astro';
import { getCases, caseUrl } from '../lib/model';
import { SITE_URL, site } from '../data/site';
import { gitDate } from '../lib/gitdate';

// lastmod is real: article dates come from the frontmatter, page dates from the last commit touching their source.
// Same file name as before, so Search Console keeps working.
export const GET: APIRoute = async () => {
  const cases = (await getCases()).filter(c => !c.data.noindex && !c.data.protected && !c.data.external);
  const latest = cases.map(c => c.data.dateModified).sort().at(-1)!;
  const homeDate = gitDate(['src/pages/index.astro', 'src/content/work', 'src/components/panels/Home.astro', 'src/components/panels/Work.astro', 'src/data/site.ts'], latest);
  const aboutDate = gitDate(['src/pages/about.astro', 'src/components/panels/About.astro'], latest);

  const urls = [
    { loc: '/', lastmod: homeDate, priority: '1.0' },
    { loc: '/about.html', lastmod: aboutDate, priority: '0.8' },
    { loc: site.cv.html, lastmod: site.cv.dateModified, priority: '0.6' },
    { loc: '/case-studies/', lastmod: [latest, homeDate].sort().at(-1)!, priority: '0.9' },
    ...cases.map(c => ({ loc: caseUrl(c.id), lastmod: c.data.dateModified, priority: '0.7' })),
  ];
  const body = urls.map(u => `  <url>\n    <loc>${SITE_URL}${u.loc}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
