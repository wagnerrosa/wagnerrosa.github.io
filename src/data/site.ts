// Single source for identity, contact and copy shared across head, JSON-LD, wheel and llms.txt.
// Career dates and titles come from public/assets/cv/Wagner-Rosa-CV-ATS-2026.md (source of truth).

export const SITE_URL = 'https://wagnerrosa.com';
export const abs = (path: string) => new URL(path, SITE_URL).href;

export const site = {
  name: 'Wagner Rosa',
  fullName: 'Wagner da Rosa de Souza', // only About description + Person alternateName (positioning/decisions.md)
  title: 'Product Designer',
  hubRole: 'Product Designer',   // the short line under the name on the wheel (the full title stays in titles and JSON-LD)
  email: 'contato@wagnerrosa.com',
  place: 'Porto Alegre, Brazil',
  timezone: 'GMT-3',
  badge: 'Open to remote',
  invitation: 'Open to remote Product Design opportunities.',
  ga: 'G-VTCEP9QKNC',
  clarity: 'vhbu1gthme',
  ogImage: '/assets/og/og-default.png',
  ogImageVersion: '20261002',
  ogImageAlt: 'Wagner Rosa — Product Designer. UX, Product Design, Design Systems, Applied AI.',
  avatar: '/assets/wagnerrosa-picture.jpg',
  cv: {
    pdf: '/assets/cv/Wagner-Rosa-CV-oct2026.pdf',
    md: '/assets/cv/Wagner-Rosa-CV-ATS-2026.md',
    html: '/cv.html',
    dateModified: '2026-10-24', // bump with every edit of the CV .md
  },
};

export const profiles = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/wagnerrosa/' },
  { label: 'Behance', href: 'https://www.behance.net/wagnerrosa' },
  { label: 'GitHub', href: 'https://github.com/wagnerrosa' },
] as const;

export const hero = {
  lines: ['I design products,', 'prototype in code,', 'and help teams ship.'],
  lede: 'Product Designer with 10+ years turning complex products, business logic and AI-powered workflows into clear interfaces and shipped experiences.',
  now: 'UX Lead at Nelogica',
};

export const about = {
  background: [
    'I was born in Porto Alegre, Brazil, and began my career in communication and marketing before moving to Lisbon, where I graduated in Advertising and Marketing at the <a href="https://www.iade.europeia.pt/en/" target="_blank" rel="noopener noreferrer">Institute of Arts and Design of Lisbon</a> in 2016.',
    'My professional path started in audiovisual production and graphic design, gradually evolving into web design and digital products. This transition heavily shaped how I approach product design today: structured, system-oriented, and grounded in real implementation constraints.',
    'To better understand the boundaries of digital interfaces, I taught myself front-end fundamentals. This structural knowledge allows me to collaborate closely with engineering teams and design solutions that are both conceptually clear and technically feasible.',
    'Today, as UX Lead at Nelogica, I focus on scalable digital systems, AI-powered products, and complex operational workflows that require architecture and long-term thinking.',
  ],
  outside:
    'Outside of work, I run long distances (including a completed marathon), climb, and ride motorcycles — practices that reinforce focus, patience, and consistency. Riding also led me to create <a href="https://carburante.motorcycles/?lang=en" target="_blank" rel="noopener noreferrer">Carburante ↗</a>, a native iOS logbook for motorcycles that I design, develop, and maintain as a personal project.',
};

// Person node shared by every JSON-LD block (@id lets pages reference it instead of repeating it).
export const person = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: site.name,
  alternateName: site.fullName,
  jobTitle: 'Product Designer',
  description: 'Product Designer, currently UX Lead at Nelogica, working on complex financial products, design systems, AI and prototyping in code.',
  url: `${SITE_URL}/`,
  image: abs(site.avatar),
  email: site.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Porto Alegre', addressCountry: 'BR' },
  worksFor: { '@type': 'Organization', name: 'Nelogica', url: 'https://www.nelogica.com.br/' },
  alumniOf: [
    { '@type': 'CollegeOrUniversity', name: 'IADE - Creative University (Institute of Arts and Design of Lisbon)', url: 'https://www.iade.europeia.pt/en/' },
    { '@type': 'EducationalOrganization', name: 'UX Design Institute', url: 'https://www.uxdesigninstitute.com/' },
  ],
  knowsAbout: ['UX Design', 'Product Design', 'Design Systems', 'Interaction Design', 'Prototyping', 'Design-to-Code', 'Front-End Development', 'Applied AI', 'iOS Development'],
  sameAs: ['https://www.linkedin.com/in/wagnerrosa/', 'https://github.com/wagnerrosa', 'https://www.behance.net/wagnerrosa'],
};
