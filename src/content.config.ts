import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Missing SEO fields (title, description, dates) break the build instead of shipping an empty tag.
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD');

const caseSchema = z.object({
    title: z.string(),                       // h1 and <title> stem
    headline: z.string().optional(),         // JSON-LD headline when it differs from the h1
    short: z.string(),                       // label on the wheel
    client: z.string(),
    icon: z.string(),                        // file in src/assets/icons
    year: z.number(),
    category: z.string(),
    metaTitle: z.string().optional(),        // <title> when it differs from "{title} | Wagner Rosa"
    description: z.string(),                 // meta description
    ogDescription: z.string().optional(),
    blurb: z.string(),                       // card / panel summary
    llms: z.string().optional(),             // one-line summary for llms.txt (falls back to blurb)
    readMinutes: z.number().optional(),      // computed from the text when omitted
    datePublished: isoDate,
    dateModified: isoDate,
    lang: z.enum(['en', 'pt-BR']).default('en'),
    translationOf: z.string().optional(),    // slug of the English original (hreflang pair)
    protected: z.boolean().default(false),
    external: z.string().url().optional(),   // case that lives on another site (none today: Carburante has its own case now)
    presentation: z.enum(['reading', 'editorial']).default('reading'),   // editorial: wider stage for media compositions, text keeps the 700px measure (docs: positioning/notes/case-model-2026-10-25.md)
    noindex: z.boolean().default(false),
    wheel: z.boolean().default(true),        // gets a row on the wheel
    hub: z.boolean().default(true),          // listed in the case studies hub
    order: z.number(),
});

const cases = defineCollection({ loader: glob({ pattern: '*.mdx', base: './src/content/cases' }), schema: caseSchema });

// The protected case study lives in private/ (git-ignored). It is only built by the local `build:protected` run (INCLUDE_PRIVATE=1),
// whose output is encrypted and committed; the public build never sees it.
const privateCases = defineCollection({
  loader: glob({ pattern: process.env.INCLUDE_PRIVATE ? '*.mdx' : '__none__.mdx', base: './private' }),
  schema: caseSchema,
});

const work = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/work' }),
  schema: z.object({
    label: z.string(),
    title: z.string().optional(),
    tag: z.string(),
    role: z.string(),
    period: z.string(),
    icon: z.string(),
    iconTile: z.boolean().default(false),
    desc: z.string(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    bullets: z.array(z.string()),
    related: z.array(z.string()).default([]),
    visit: z.string(),                       // link label
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).default([]),   // extra outbound links
    href: z.string().url(),
    order: z.number(),
  }),
});

// The ATS CV stays a public .md (source of truth for dates and titles); cv.html renders it at build time.
const cv = defineCollection({
  loader: glob({ pattern: 'Wagner-Rosa-CV-ATS-2026.md', base: './public/assets/cv' }),
  schema: z.object({}).passthrough(),
});

export const collections = { cases, privateCases, work, cv };
