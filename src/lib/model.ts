import { getCollection, type CollectionEntry } from 'astro:content';

export type Kind = 'home' | 'work' | 'cases' | 'case' | 'about' | 'contact';
export type PageId = 'index' | 'cases' | 'about';

export interface WheelItem {
  id: string;
  kind: Kind;
  label: string;
  tag: string;
  level: 0 | 1;
  url: string;          // real URL for this stop (path + hash)
  page: PageId;         // the page whose HTML carries this panel for real
  title: string;        // document title once the wheel settles here
  read?: string;        // article URL when the stop can be read in place
  external?: string;
  locked?: boolean;     // password protected
  slug?: string;
}

export type Case = CollectionEntry<'cases'>;
export type Work = CollectionEntry<'work'>;

export const caseUrl = (slug: string) => `/case-studies/${slug}.html`;
export const readMinutes = (c: Case) => c.data.readMinutes ?? Math.max(1, Math.round((c.body ?? '').split(/\s+/).length / 220));

export async function getCases(): Promise<Case[]> {
  return (await getCollection('cases')).sort((a, b) => a.data.order - b.data.order);
}

/** Full article of a protected case. Only present in the local `build:protected` run (INCLUDE_PRIVATE=1). */
export async function getPrivateCase(slug: string) {
  return (await getCollection('privateCases')).find(c => c.id === slug);
}

export async function getModel() {
  const cases = await getCases();
  const work = (await getCollection('work')).sort((a, b) => a.data.order - b.data.order);
  const wheelCases = cases.filter(c => c.data.wheel);
  const hubCases = cases.filter(c => c.data.hub);

  const items: WheelItem[] = [
    { id: 'index', kind: 'home', label: 'Home', tag: 'Hello', level: 0, url: '/', page: 'index', title: 'Wagner Rosa — UX Lead & Product Designer' },
    ...work.map<WheelItem>(w => ({
      id: w.id, kind: 'work', label: w.data.label, tag: w.data.tag, level: 1, url: `/#${w.id}`, page: 'index',
      title: `${w.data.title ?? w.data.label} · Wagner Rosa`,
    })),
    { id: 'cases', kind: 'cases', label: 'Case studies', tag: String(hubCases.length), level: 0, url: '/case-studies/', page: 'cases', title: 'UX & Product Design Case Studies | Wagner Rosa' },
    ...wheelCases.map<WheelItem>(c => ({
      id: `case-${c.id}`, kind: 'case', label: c.data.short, tag: c.data.category, level: 1, url: `/case-studies/#${c.id}`, page: 'cases',
      title: `${c.data.title} | Wagner Rosa`, slug: c.id,
      ...(c.data.external ? { external: c.data.external } : { read: caseUrl(c.id) }),
      ...(c.data.protected ? { locked: true } : {}),
    })),
    { id: 'about', kind: 'about', label: 'About', tag: 'Background', level: 0, url: '/about.html', page: 'about', title: 'About Wagner Rosa | UX Lead & Product Designer' },
    { id: 'contact', kind: 'contact', label: 'Contact', tag: 'Say hi', level: 0, url: '/#contact', page: 'index', title: 'Contact · Wagner Rosa' },
  ];
  return { items, work, cases, wheelCases, hubCases };
}

export type Model = Awaited<ReturnType<typeof getModel>>;
