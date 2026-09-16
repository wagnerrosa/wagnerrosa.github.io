#!/usr/bin/env bash
# Encrypts protected case studies from case-studies-src/ into case-studies/
# Source files are never published — only the encrypted output is.
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

npx staticrypt case-studies-src/planton-genius.html \
  --template case-studies-src/_password-template.html \
  --template-title "Planton Genius" \
  --template-instructions "A redesign of a B2B emissions inventory SaaS, prototyped in production React alongside the engineering team. This one is private, shared by password." \
  --template-placeholder "Password" \
  --template-button "Read case study" \
  --template-error "That password is not right. Check for typos and try again." \
  --template-remember "Remember me on this device" \
  --remember 30 \
  --short \
  -d case-studies

if [ ! -f case-studies/planton-genius.html ]; then
  echo "Error: encryption produced no output file." >&2
  exit 1
fi

echo "Encrypted → case-studies/planton-genius.html"
