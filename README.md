# LOKALENS Perak (prototype)

Explore districts. Discover local merchants. Mobile-first PWA-style web app.

Stack: React + Vite + Tailwind CSS v4, Supabase (Postgres, Auth, Storage, Edge Functions), Gemini API.

## 1. Run in demo mode (no keys needed)

```bash
npm install
npm run dev
```

Open the URL on your phone (same Wi-Fi, use `npm run dev -- --host`) or desktop.
Demo mode stores data in the browser and uses rule-based AI. A yellow banner shows this.
Use the **EN / BM** selector at the top of the app to switch between English and Bahasa Malaysia. Your choice is saved in this browser.

The merchant registration starts with one rough-notes prompt. Generate a profile and suggested tags, review/edit them, then add contact and location details.

## 2. Connect Supabase (live mode)

1. Create a project at supabase.com.
2. SQL Editor: run `supabase/schema.sql`, then `supabase/seed.sql`.
   If you already have a project, rerun `supabase/schema.sql` to apply the latest columns, review policies, and analytics functions.
3. Authentication > Sign In / Providers: enable **Anonymous sign-ins**.
4. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.
5. Deploy the AI function:

```bash
npx supabase login
npx supabase link --project-ref YOUR_REF
npx supabase secrets set GEMINI_API_KEY=xxx ADMIN_PASSCODE=pick-one
npx supabase functions deploy ai
```

Optional: `npx supabase secrets set GEMINI_MODEL=model-name` to change the model.

If the AI call fails, the app falls back to the rule-based version, so the demo never breaks.

## 3. Screens

| Route | Screen | Proposal feature |
|---|---|---|
| `#/` | Explore: search, district tabs, categories, highlights | i. District directory, iii. Highlights |
| `#/m/:id` | Merchant profile, Navigate + WhatsApp buttons | i. Directory |
| `#/trip` | AI Trip Planner | Visitor routing |
| `#/saved` | Saved shops | |
| `#/peniaga` | Merchant landing, then dashboard | iv. Analytics |
| `#/peniaga/daftar` | Rough notes > AI draft > review > WhatsApp, photos, GPS > publish | ii. AI profile writing |
| `#/admin` | Single admin page: executive analytics plus district announcement drafting and publishing | Government analytics and highlights |

The Explore screen includes an **Icon + 1** spillover demo for Gua Tempurung and Kellie's Castle, and a top-rated merchants row (4+ stars with at least 3 reviews). Demo listings and demo reviews are illustrative; live mode uses published merchants with GPS coordinates and Supabase reviews. Merchant profiles support photo galleries and an optional embedded TikTok video. Admin analytics refresh every 10 seconds. Demo mode clearly labels its illustrative baseline; live mode reads town-level aggregates from Supabase. WhatsApp contact clicks are written to `events` before opening WhatsApp.

## 4. How the AI stays safe

- Profile: AI drafts, merchant edits every field before publishing. Prompt forbids invented prices, halal status, awards.
- Trip: AI picks only from merchant IDs in the database. Unknown IDs are dropped. Clock times and travel times are computed in code, and stops closed at arrival time are removed.
- Highlights: AI summarises admin text only. Admin reviews before publishing. Passcode checked on the server.
- Reviews: visitor names and comments are public. Anonymous reviews are enabled for the prototype; add moderation and abuse controls before a public production launch.
- The Gemini key lives in the edge function, never in the browser.

## 5. Analytics

Every profile view (once per browser session), WhatsApp tap and Navigate tap writes a row to `events`.
`merchant_stats()` returns 7-day counts and the previous 7 days for the trend arrow. Owners see only their own shop. Sample shops are open for the demo.

## 6. Sample data

`src/data/seed.js` holds 10 sample merchants (6 Kinta, 4 Kuala Kangsar), labeled "Data contoh" in the UI.
Sample listings have no phone number. Their WhatsApp button opens the share picker, so a demo tap never messages a stranger.
After editing seed.js, run `npm run seed:sql` to regenerate `supabase/seed.sql`.

## 7. Share a demo build

```bash
npm run build:demo   # one self-contained file: dist-demo/index.html
npm run build        # normal build for Vercel/Netlify: dist/
```
