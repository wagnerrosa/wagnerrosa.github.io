# Protected case studies

Some case studies are password-protected with [staticrypt](https://github.com/robinmoisson/staticrypt).
The site stays on GitHub Pages — no backend, no server.

## How it works

```
case-studies-src/planton-genius.html   →  encrypted  →  case-studies/planton-genius.html
        (never committed)                                  (published, public)
```

The published file contains only an AES-256 blob plus the decryption JS. The password
in plain text is never written to it, so "view source" and devtools reveal nothing.

## Writing

Edit the source in `case-studies-src/`, **not** `case-studies/`.
Anything written directly into `case-studies/planton-genius.html` is overwritten on the next build.

Source files use the same head/header/footer pattern as any other case study — see
`CLAUDE.md` for the layout rules.

## Building

```bash
npm run build           # Tailwind + encrypt protected pages
npm run build:protected # encrypt only
```

The password is read from `.env.local` (git-ignored):

```
STATICRYPT_PASSWORD="your-password-here"
```

The salt lives in `.staticrypt.json` (git-ignored). Keep it: changing the salt
invalidates every "Remember me" session already saved in visitors' browsers.

**Password hint:** staticrypt has no `--template-hint` option, so the hint is hardcoded
in `case-studies-src/_password-template.html` (search for `staticrypt-hint`).
Change it there whenever the password changes.

## Adding another protected case study

1. Create `case-studies-src/<name>.html`
2. Add a matching `npx staticrypt` block in `build-protected.sh` (copy the existing one,
   change the filename and `--template-title`)
3. Add the entry to `case-studies/index.html`, marked `Password required`
4. Add a `Disallow:` line for it in `robots.txt`
5. `npm run build`

## ⚠️ Backup

`case-studies-src/` and `.env.local` are git-ignored, so **they exist only on this machine
and are not backed up by git**. Keep a copy somewhere safe (password manager for the
password, cloud storage or a private repo for the sources). If this laptop dies, the
encrypted page on GitHub cannot be edited — only decrypted, and only with the password.

## Limits of this approach

Stops casual access, link-sharing and search engine indexing.

It is **not** server-side auth:

- The encrypted file is public. It can be downloaded and brute-forced **offline** — no
  rate limiting, no logs. Password strength is the only thing standing in the way.
- Anyone given the password can pass it on.
- **Publishing is not reversible.** A pushed version stays in the Git history and in
  caches; rotating the password later does not un-publish it. Review content before the
  first push.

For anything under NDA or a contractual confidentiality obligation, use auth that runs
before any bytes are served — Cloudflare Pages + Access, or Netlify password protection.
Both keep this repo, build and domain; only the host changes.
