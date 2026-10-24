import type { APIRoute } from 'astro';
import { getCases, caseUrl } from '../lib/model';
import { profiles, site, SITE_URL } from '../data/site';

// llms.txt for LLM crawlers: the same facts as the site, generated from the same sources (collections + data/site.ts).

export const GET: APIRoute = async () => {
  const cases = (await getCases()).filter(c => !c.data.protected && !c.data.external);
  const line = (title: string, path: string, text: string) => `- [${title}](${SITE_URL}${path}): ${text}`;
  const studies = cases.filter(c => c.data.hub && c.data.category === 'Case study');
  const writing = cases.filter(c => /essay/i.test(c.data.category));
  const ptOf = (id: string) => cases.find(c => c.data.translationOf === id);

  const body = `# ${site.name}

> UX Lead and Product Designer based in ${site.place} (${site.timezone}). Currently UX Lead at Nelogica, leading a team of 5 UX Designers on financial and trading platforms. Previously Senior Product Designer at Planton and Art Director at Sistema FIERGS. Works across product design, design systems, AI-powered workflows and design-to-code. Open to remote Product Design opportunities.

## About

Born in Porto Alegre, Brazil. Started in communication and marketing, then moved to Lisbon and graduated in Advertising and Marketing at IADE, the Institute of Arts and Design of Lisbon, in 2016. Also completed the UX Design Institute program.

The career began in audiovisual production and graphic design and evolved into web design and digital products. That path shapes the approach to product design: structured, system-oriented and grounded in real implementation constraints.

Self-taught in front-end fundamentals, which allows close collaboration with engineering teams and solutions that are both conceptually clear and technically feasible. Today the focus is scalable digital systems, AI-powered products and operational workflows that require clarity, architecture and long-term thinking.

Outside of work: runs long distances (including a completed marathon), climbs and rides motorcycles. Riding led to Carburante, a native iOS logbook for motorcycles that Wagner designs and builds as a personal project (https://carburante.motorcycles/).

## Pages

- [Home](${SITE_URL}/): Selected work and experience.
- [About](${SITE_URL}/about.html): Background, approach and life outside of work.
- [CV (HTML)](${SITE_URL}${site.cv.html}): ATS-friendly CV, public preview.
- [CV (Markdown)](${SITE_URL}${site.cv.md}): Plain-text CV, source of truth for career dates and titles.
- [Case studies](${SITE_URL}/case-studies/): Index of all articles and case studies.

## Case studies

${studies.map(c => {
    const pt = ptOf(c.id);
    return line(c.data.title, caseUrl(c.id), `${c.data.llms ?? c.data.blurb}${pt ? ` Also available in [Portuguese](${SITE_URL}${caseUrl(pt.id)}).` : ''}`);
  }).join('\n')}

## Writing

${writing.map(c => line(c.data.title, caseUrl(c.id), c.data.llms ?? c.data.blurb)).join('\n')}

## Profiles

${profiles.map(p => `- [${p.label}](${p.href.replace(/\/$/, '')})`).join('\n')}

## Contact

- Email: ${site.email}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
