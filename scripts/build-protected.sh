#!/usr/bin/env bash
# Builds the protected case study and encrypts it with staticrypt.
#
#   private/planton-genius.mdx  --astro build (INCLUDE_PRIVATE=1)-->  .protected-build/case-studies/planton-genius.html
#   --staticrypt with scripts/gate-template.html-->  public/case-studies/planton-genius.html   (committed, published)
#
# The source never leaves this machine; only the encrypted blob is committed. The blob freezes the page shell as of this
# run (stylesheet and script file names are hashed), so run this again whenever the layout changes.
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -f .env.local ]; then
  # shellcheck disable=SC1091
  set -a; source .env.local; set +a
fi

if [ -z "${STATICRYPT_PASSWORD:-}" ]; then
  echo "Error: STATICRYPT_PASSWORD not set. Add it to .env.local" >&2
  exit 1
fi

SRC=private/planton-genius.mdx
OUT=public/case-studies/planton-genius.html
BUILD=.protected-build

if [ ! -f "$SRC" ]; then
  echo "Error: $SRC not found. The protected article source lives only on the author's machine (see scripts/README.md)." >&2
  exit 1
fi

# The committed blob sits in public/ and would overwrite the plain page in the build output: set it aside while building.
STASH=""
if [ -f "$OUT" ]; then STASH="$(mktemp)"; mv "$OUT" "$STASH"; fi
restore() { if [ -n "$STASH" ] && [ -f "$STASH" ] && [ ! -f "$OUT" ]; then mv "$STASH" "$OUT"; fi; rm -rf "$BUILD"; }
trap restore EXIT

INCLUDE_PRIVATE=1 npx astro build --outDir "$BUILD" >/dev/null

PAGE="$BUILD/case-studies/planton-genius.html"
if [ ! -f "$PAGE" ]; then
  echo "Error: astro build produced no $PAGE" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"
npx staticrypt "$PAGE" \
  --template scripts/gate-template.html \
  --template-title "Planton Genius" \
  --template-instructions "A redesign of a B2B emissions inventory SaaS, prototyped in production React alongside the engineering team. This one is private, shared by password." \
  --template-placeholder "Password" \
  --template-button "Read case study" \
  --template-error "That password is not right. Check for typos and try again." \
  --template-remember "Remember me on this device" \
  --remember 30 \
  --short \
  -d "$(dirname "$OUT")"

if [ ! -f "$OUT" ]; then
  echo "Error: encryption produced no output file." >&2
  exit 1
fi

rm -f "$STASH"; STASH=""
echo "Encrypted → $OUT"
