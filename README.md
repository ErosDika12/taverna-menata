# Taverna Menata

Website for Taverna Menata — a traditional restaurant in Prishtina (Rr. Faton Shabani).

## Structure

- `backend/` — Express API + SQLite database. Serves the menu, gallery, site settings
  and the optimized photos in `backend/uploads/`. On first start the database is
  seeded from `backend/seed-data.js` (full menu with real prices, all photos).
- `frontend/` — React (Vite) site: Home, Menu, Gallery, About, Contact.
  Mobile-first with a sticky bottom tab bar; desktop gets a top navbar.

## Run locally

**Both servers are required for photos and videos to load.**

```bash
# 1. API (port 4000) — serves /api and /uploads
cd backend
npm install
npm start

# 2. Frontend dev server (port 5173, proxies /api and /uploads)
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** (development) or **http://localhost:4000** (production build).

Verify media: `cd backend && npm run media-audit`

## Production

```bash
cd frontend && npm run build
cd ../backend && npm start
```

The backend serves the built frontend from `frontend/dist` on port 4000.

## Languages

The public site supports **Albanian (default)** and **English**. Visitors switch with the
AL / EN toggle in the header. Content is stored bilingually in the database.

## Admin panel

Open **http://localhost:5173/admin** (or `/admin` on your domain). You will be redirected to `/admin/login`.

**Login (local development):**

| Field | Value |
|-------|-------|
| Email | `admin@menata.local` |
| Password | value of `ADMIN_PASSWORD`, or `local-dev-admin-change-me` when it is not set |

In production (Railway / Vercel) the server refuses to start unless `ADMIN_PASSWORD` is set to
12+ characters. Change the password after login via **Settings → Change admin password**.

The admin panel lets you edit:

- Menu categories, items, prices and availability
- Gallery photos and videos
- Homepage and About text (AL + EN)
- Contact details and opening hours

No analytics, bookings, or QR tools — kept simple for non-technical staff.

## Content

All content lives in the database and can be edited from the admin panel. To re-seed from
scratch: `cd backend && npm run reseed`

## Photos

Menu and gallery photos are cropped to a 4:5 frame (1080×1350) when uploaded in the admin,
so every photo on the site has the same shape.

## Videos

Gallery videos live in `frontend/public/videos/`. New ones can be uploaded through
**Admin → Galeria → Video**.

## Deployment

| | Link |
|---|---|
| Website (Railway, main) | https://taverna-menata-production.up.railway.app |
| Admin (Railway) | https://taverna-menata-production.up.railway.app/admin |
| Website (Vercel) | https://taverna-menata.vercel.app |

**Railway** builds with `railway.json` and keeps the database and uploads on a volume mounted
at `/data`. Auto-deploy is not connected to GitHub yet, so after a push use
**Railway → Deployments → Redeploy**.

Railway variables:

| Variable | Purpose |
|---|---|
| `DATA_DIR` | `/data` — persistent folder for the database and uploads |
| `ADMIN_PASSWORD` | admin login password (12+ characters) |
| `ADMIN_SECRET` | signing key for admin sessions |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | weekly backups |

**Vercel** only has temporary storage (`/tmp`), so changes made in its admin can be lost
when the function restarts. Use the Railway site for editing content.

## Backups

Once a week the server copies the database and any new uploads to the Cloudflare R2 bucket
`taverna-menata-backups` (`db/menata-YYYY-MM-DD.db`, last 8 kept; `uploads/…`).
Run one by hand with `cd backend && npm run backup`.
