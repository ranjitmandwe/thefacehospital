
# The Face Hospital — Next.js Site

## Quick start (local)
1. Install Node.js 18+
2. `npm i`
3. `npm run dev`
4. Open http://localhost:3000

## Deploy on Vercel
1. Create a new Vercel Project and import this folder.
2. Click Deploy.
3. Add custom domain `thefacehospital.in` in Vercel → Domains.
4. Update DNS at your domain provider to point to Vercel (A/AAAA/CNAME as guided).

## Notes
- Assets are in `/public/images`.
- Gold accent is defined as CSS variable `--gold` in `app/globals.css`.
- UI components are simple shadcn-like wrappers in `components/ui` (no external lib needed).
