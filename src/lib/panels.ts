import type { Case, Model, WheelItem } from './model';
import { caseUrl, readMinutes } from './model';

/** Arrow for a link between wheel stops: ↓ the wheel turns forward, ↑ backward. */
export function stopLink(model: Model, from: string, toId: string) {
  const idx = (id: string) => model.items.findIndex(i => i.id === id);
  const to = model.items[idx(toId)];
  return { href: to.url, arrow: idx(toId) > idx(from) ? '↓' : '↑' };
}

export function metaOf(c: Case): string {
  if (c.data.protected) return 'Private · password';
  if (c.data.external) return 'Independent · App Store';
  const mins = `${readMinutes(c)} min read`;
  return /essay/i.test(c.data.category) ? `Essay · ${mins}` : mins;
}

export const rowHref = (c: Case) => c.data.external ?? caseUrl(c.id);

export const itemById = (model: Model, id: string): WheelItem => {
  const it = model.items.find(i => i.id === id);
  if (!it) throw new Error(`No wheel item "${id}"`);
  return it;
};
