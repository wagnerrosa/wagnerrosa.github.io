import { execFileSync } from 'node:child_process';

/** Date (YYYY-MM-DD) of the last commit touching any of these paths; falls back to `fallback` when git history is unavailable. */
export function gitDate(paths: string[], fallback: string): string {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], { encoding: 'utf8' }).trim();
    return out || fallback;
  } catch {
    return fallback;
  }
}
