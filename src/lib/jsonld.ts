import { SITE_URL, abs, person, site } from '../data/site';

const ctx = 'https://schema.org';
const authorRef = { '@type': 'Person', '@id': person['@id'], name: site.name, url: `${SITE_URL}/` };

export const homeGraph = () => ({
  '@context': ctx,
  '@graph': [
    person,
    { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, name: site.name, alternateName: 'wagnerrosa.com', url: `${SITE_URL}/`, publisher: { '@id': person['@id'] } },
  ],
});

// Carburante has a visible counterpart on the home page (work panel), so the schema is allowed (positioning/seo-dont-list).
export const carburanteApp = () => ({
  '@context': ctx,
  '@type': 'SoftwareApplication',
  '@id': `${SITE_URL}/carburante/#app`,
  name: 'Carburante',
  description: 'Native iOS logbook for motorcycles: fuel-ups, real fuel economy and maintenance tracking, offline-first.',
  url: 'https://carburante.motorcycles/',
  image: 'https://carburante.motorcycles/assets/og.png',
  operatingSystem: 'iOS 18+',
  applicationCategory: 'UtilitiesApplication',
  sameAs: ['https://github.com/wagnerrosa/carburante'],
  author: { '@id': person['@id'] },
});

export const profilePage = (path: string, name: string, dateModified?: string) => ({
  '@context': ctx,
  '@type': 'ProfilePage',
  url: abs(path),
  name,
  ...(dateModified ? { dateModified } : {}),
  mainEntity: person,
});

export const article = (o: { path: string; headline: string; description: string; lang: string; datePublished: string; dateModified: string }) => ({
  '@context': ctx,
  '@type': 'Article',
  headline: o.headline,
  description: o.description,
  url: abs(o.path),
  mainEntityOfPage: abs(o.path),
  inLanguage: o.lang,
  datePublished: o.datePublished,
  dateModified: o.dateModified,
  image: abs(site.ogImage),
  author: authorRef,
});

// ItemList mirrors the list the visitor sees on the hub (no schema without a visible counterpart).
export const collectionPage = (o: { path: string; name: string; description: string; items: { name: string; url: string }[] }) => ({
  '@context': ctx,
  '@type': 'CollectionPage',
  url: abs(o.path),
  name: o.name,
  description: o.description,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  author: { '@id': person['@id'] },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: o.items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: it.url })),
  },
});
