# V144 source-sync branch

This branch is a safe migration bridge for the currently live V144 static site.

## How it works
- During a Vercel build, `scripts/mirror.mjs` mirrors the currently live production site from `https://www.thefacehospital.in` into `dist/`.
- Files placed under `overrides/` are copied over the mirrored site after the crawl and therefore win.
- This lets us connect Git safely without replacing the live V144 design with the older Next.js source already present in the repository.

## Safety
Do not make this branch production until a Vercel Preview generated from this branch has been visually checked against the live site.

## Future editing
As pages are actively edited, place their maintained source copies in `overrides/`. Over time the site can be fully source-controlled without relying on the mirror bridge.
