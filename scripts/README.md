# Scripts

| File | What it does |
|---|---|
| `seo-snapshot.mjs` | Snapshots the head, JSON-LD, links and visible text of every HTML page in a directory, and diffs two snapshots. Used to prove SEO parity with the legacy site. |
| `build-protected.sh` | Builds and encrypts the protected case study (see below). |
| `gate-template.html` | The password page (staticrypt template), in the site's tokens. Standalone: it is encrypted into the blob, so it cannot use the site bundle. |
| `og-template.html` | Source of `public/assets/og/og-default.png`. |

## SEO snapshot

```bash
npm run build
node scripts/seo-snapshot.mjs dist positioning/baseline/current.json
node scripts/seo-snapshot.mjs --diff positioning/baseline/legacy-final-2026-10-24.json positioning/baseline/current.json
```

The baseline was taken from the git tag `legacy-final` (the last Tailwind/hand-written site). Expected differences after the migration: the viewport tag, the hub's new `CollectionPage` JSON-LD, `og:url`/`twitter:card` on the two noindex essays, and the removal of the old protected page from `dist` (it is copied from `public/`).

## Protected case study

```
private/planton-genius.mdx                  (git-ignored, only on the author's machine)
   │  INCLUDE_PRIVATE=1 astro build --outDir .protected-build
   ▼
.protected-build/case-studies/planton-genius.html   (the page in the full site shell)
   │  staticrypt --template scripts/gate-template.html
   ▼
public/case-studies/planton-genius.html     (AES-256 blob + decryption JS; committed and published)
```

The password never reaches the repository or CI: the CI build just copies the committed blob.

```bash
npm run build:protected
```

- Password: `.env.local` → `STATICRYPT_PASSWORD="…"`. Salt: `.staticrypt.json` (keep it: changing it invalidates every "remember me" already saved in visitors' browsers).
- The password hint is hardcoded in `scripts/gate-template.html` (`staticrypt-hint`); change it there with the password.
- The reading layer on the site fetches this file, reads the salt and ciphertext as text, and decrypts in the browser with the same key derivation staticrypt uses. If you upgrade staticrypt, check that its key derivation (1k SHA-1, 14k SHA-256, 585k SHA-256) is unchanged, or the in-page unlock in `src/scripts/wheel.ts` breaks while the standalone gate keeps working.
- **The blob freezes the shell.** Stylesheet and script file names are hashed; after any layout, style or script change, run `npm run build:protected` again and commit the new blob. Images used by a private article must live in `public/` (the private build's `_astro/` files are not published).

### Another protected case

Add `private/<slug>.mdx` and a public stub `src/content/cases/<slug>.mdx` with `protected: true` (frontmatter only). Generalise `build-protected.sh` (it handles one file today). Don't list it in `robots.txt`.

### ⚠️ Backup

`private/`, `.env.local` and `.staticrypt.json` are git-ignored, so they exist only on this machine. Keep a copy (password manager for the password; private storage or a private repo for the sources). If the laptop dies, the encrypted page on GitHub can only be decrypted, not edited.
