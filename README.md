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

Open **http://localhost:5173/admin** (or `/admin` on your domain).

Default password: `menata2024` (change via **Gjuha** in the admin, or set `ADMIN_PASSWORD`
before first seed).

The admin panel lets you edit:

- Menu categories, items, prices and availability
- Gallery photos and videos
- Homepage and About text (AL + EN)
- Contact details and opening hours

No analytics, bookings, or QR tools — kept simple for non-technical staff.

## Content

All content lives in the database and can be edited from the admin panel. To re-seed from
scratch: `cd backend && npm run reseed`

## Videos

No videos were included in the original project files. Upload real restaurant videos through
**Admin → Galeria → Video**.
