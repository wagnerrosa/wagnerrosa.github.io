import type { ImageMetadata } from 'astro';

const all = import.meta.glob<{ default: ImageMetadata }>('/src/assets/**/*.{webp,png,jpg,jpeg,svg}', { eager: true });

/** Resolve a path relative to src/assets (e.g. "icons/planton-ico.webp") to its image metadata. */
export function asset(path: string): ImageMetadata {
  const hit = all[`/src/assets/${path}`];
  if (!hit) throw new Error(`Image not found in src/assets: ${path}`);
  return hit.default;
}

export const icon = (name: string) => asset(`icons/${name}`);
