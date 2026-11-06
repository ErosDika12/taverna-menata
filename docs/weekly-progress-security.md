# Weekly Progress — Security & Feston's Tasks

Plain-language log of what was done, why, and how it was tested. Written for
Feston/Eros, not just for other developers.

---

## 1. General security hardening

**TASK:** Full security audit and remediation of the admin login system.
**OWNER:** Eros (work was already started by Eros before this session; this
session finished it).
**STATUS:** DONE (backend code + local tests). Production env vars still
need to be rotated by whoever has Vercel/Railway access — see "What's left"
below.

**WHAT WAS DONE:**
- The admin password is no longer allowed to be the old default
  (`menata2024`) in production — the server now refuses to start if a real
  password isn't configured.
- The secret key used to "sign" a logged-in admin's session used to be
  derivable from the password itself, which meant anyone who found the
  password hash (which was sitting in our public GitHub repo) could forge a
  valid admin login without ever knowing the password. That's fixed — the
  signing key now only comes from a server setting (`ADMIN_SECRET`) that is
  never stored in the database or the repo.
- Previously, if an admin's account was deleted, a still-valid login token
  could recreate that account from the token's own claims — meaning deleting
  someone's access didn't actually revoke it. That's removed. Deleting,
  suspending, or changing an admin's role now takes effect immediately.
- Passwords are now stored using a proper slow-hashing method (`scrypt`)
  instead of a single fast SHA-256 hash. This matters because fast hashes
  can be "cracked" by guessing millions of passwords per second if the
  database ever leaks; slow hashing makes that impractical.
- The admin login session moved out of the browser's local storage (which
  any script on the page can read) into a secure, browser-managed cookie
  that JavaScript cannot read at all.
- Login sessions now expire after 45 minutes instead of 30 days.
- Uploaded files are now checked by their actual content, not just their
  filename or the label the browser sends — this stops someone uploading a
  disguised file (e.g. a webpage pretending to be a photo).
- The real production database file (which contained the admin password and
  live login sessions) is no longer stored in the public GitHub repo.

**HOW IT WORKS (plain language):**
Think of the admin login like a wristband at an event. Before: the
wristband's "ink" (signature) could be recreated by anyone who found the
guest list, and even a cancelled wristband would still work because the
door only checked the ink, not whether that person was still on the list.
Now: the door checks the ink AND the current guest list every single time,
and the ink itself can't be recreated from anything public.

**WHY THIS APPROACH WAS CHOSEN:**
These were all real, provable attack paths (see `verify-admin-ui.mjs` and
the forged-token test in this session's work) — not theoretical. Fixing
them server-side (rather than just hiding buttons in the admin UI) matters
because a determined visitor can always talk to the API directly, bypassing
the website's buttons entirely.

**ALTERNATIVES CONSIDERED:**
- Argon2id password hashing was considered (the task brief's first choice)
  but needs a native addon that isn't guaranteed to build cleanly on every
  hosting platform; Node's built-in `scrypt` gives the same security
  property (slow, salted hashing) with zero extra dependencies.
- A full "refresh token" system was considered for session renewal but
  skipped for now — a 45-minute session that requires logging in again is
  simpler and was judged sufffyicient for Menata's admin usage pattern.

**TESTS PERFORMED:**
- Old default login (`admin@menata.local` / `menata2024`) → rejected (401).
- A token forged using the OLD (vulnerable) signing method → rejected (401).
- Tampered tokens (changed admin id, changed role, expired, bad signature,
  tampered body) → all rejected (401).
- Full admin API test suite (`scripts/verify-admin-ui.mjs`) — 21/21 checks
  passed, including: unauthenticated access, an editor trying to promote
  themselves to admin, suspending an admin while they're logged in, and
  deleting an admin while they're logged in.
- Upload test: a fake HTML file renamed to `fake.jpg` was correctly
  rejected by the content check (`scripts/admin-test.js`).
- A legacy (old-style) password hash was confirmed to still log in once,
  and to silently upgrade itself to the new secure format on that login.
- `npm audit`: backend → 0 vulnerabilities of any severity. Frontend → see
  the dependency section below.

**FILES CHANGED:** `backend/db.js`, `backend/password.js` (new),
`backend/middleware/auth.js`, `backend/middleware/adminRoles.js`,
`backend/middleware/csrf.js` (new), `backend/middleware/rateLimit.js`,
`backend/routes/admin.js`, `backend/upload.js`, `backend/app.js`,
`vercel.json`, `.gitignore`, `.env.example`, `frontend/src/api.js`,
`frontend/src/admin/*.jsx`, `scripts/*.{mjs,js}`.

**COMMIT:** see "Commits" section at the bottom of this file.

**WHAT'S LEFT (needs a human with platform access):**
- Set `ADMIN_SECRET` (a long random value) and `ADMIN_PASSWORD` (a strong,
  unique password — not `menata2024`) in the Vercel project's environment
  variables, then redeploy. This repo change alone does NOT rotate the live
  secret — someone with Vercel access must do this step.
- Frontend dependency findings (react-router, vite/esbuild) are documented
  below but not upgraded — see reasoning there.

---

## 2. Frontend dependency findings (not blindly "fixed")

| Package | Current | Vulnerable range | Patched at | Runtime or dev-only | Reachable in this app? |
|---|---|---|---|---|---|
| react-router / react-router-dom | 6.x | 6.0.0 – 7.17.0 | 7.18.5 | Runtime (ships to users) | **No** — the open-redirect bug needs a user-controlled link target; every `<Link to=...>`/`navigate(...)` call in this codebase uses a hardcoded internal path, never anything from a URL/query/user input. |
| vite / esbuild | vite 5.4.x | esbuild dev-server CORS issue | needs vite 6/7 | **Dev-only build tool** | **No** — this only matters if someone can reach your local `vite dev` server directly; it is never part of the deployed site. |

**Decision:** left both as-is rather than doing a major-version migration,
per the brief's own instruction to prefer the smallest safe change and not
force a React Router rewrite unless necessary. Neither is exploitable in
how this app actually uses these libraries. If this changes (e.g. the app
starts generating links from user input), re-run `npm audit` and revisit.

---

## 3. Navigation reset / scroll-to-top

**NUMBER:** 1
**TASK:** Every nav tab should return to its top when re-tapped; Menu
should return to its category list.
**OWNER:** Eros
**STATUS:** DONE
**WHAT WE IMPLEMENTED:** Tapping the nav icon/link for the page you're
ALREADY on now smooth-scrolls that page back to the top. Tapping Menu while
already on Menu does that AND resets Menu back to its Ushqime/Pije category
list (this part already existed from earlier work and was preserved).
**HOW IT WORKS:** One shared click handler on every nav link checks "is this
the page I'm already on?" — if yes, it scrolls to top (and, for Menu only,
also fires the existing reset signal) instead of letting React Router do
nothing, which is what happened before.
**WHY WE CHOSE THIS SOLUTION:** One function in one file (`Layout.jsx`)
instead of separate scroll-reset code copied onto every page.
**TEST RESULT:** Verified in the build; manual phone-size click-through
recommended before calling this fully done on production.

## 4. Video audio always OFF by default

**NUMBER:** 2
**TASK:** Every video in Gallery/Menu/viewer should always start muted.
**OWNER:** Eros
**STATUS:** DONE
**WHAT WE IMPLEMENTED:** Removed the old "try with sound, fall back to
muted only if the browser blocks it" logic — that was the exact cause of
the inconsistent behavior Feston saw (sometimes the browser allowed sound,
sometimes it didn't, with no way to predict which). Now every video, every
single time it becomes the active one, is forced to muted = on. The sound
button still lets a customer manually turn sound on for the video they're
currently watching; moving to the next video always re-mutes.
**HOW IT WORKS:** The shared video player component now sets "muted" the
instant a video becomes active, instead of asking the browser nicely and
hoping.
**WHY WE CHOSE THIS SOLUTION:** Deterministic beats "probably works" —
this was explicitly what Feston asked for.
**TEST RESULT:** Code-reviewed and built successfully; needs a quick manual
swipe-through on a real phone to visually confirm before calling it closed.

## 5. Large-image / media performance

**NUMBER:** 3
**TASK:** Audit and fix large media files slowing down the site.
**OWNER:** Eros
**STATUS:** PARTIAL
**WHAT WE FOUND:** Checked every photo and video currently in the repo.
Nothing currently live is anywhere near 16 MB — the largest photo is
~0.55 MB and the largest video is ~2.4 MB. The gallery already had real
(smaller) thumbnails for all 55 existing photos, so the "16 MB" Feston
experienced was very likely about future, not-yet-uploaded phone photos, or
about the number of separate thumbnail requests (already fixed in an
earlier commit that serves `/uploads` from the CDN instead of the server).
**WHAT WE IMPLEMENTED:** Going forward, every photo an admin uploads
(Gallery or Menu) is now automatically resized, compressed, and stripped of
hidden phone metadata (GPS location, etc.) on upload — so a 16 MB phone
photo can never end up live again. Gallery uploads also now get a real
small thumbnail generated automatically, instead of reusing the full photo.
**WHY WE CHOSE THIS SOLUTION:** Fixing the upload pipeline prevents the
problem from recurring, which matters more than reprocessing files that are
already a reasonable size.
**ALTERNATIVES CONSIDERED:** Multiple derivative sizes (thumb/medium/large)
with `srcset` were considered but scoped down to one optimized web size +
one thumbnail for now, to keep the change safe and testable in the time
available. A follow-up script (`backend/scripts/optimize-existing-media.js`)
is in place to regenerate thumbnails for any future legacy rows.
**TEST RESULT:** Verified the optimization pipeline runs end-to-end
locally (upload → resize → thumbnail). Did not run a full Lighthouse
before/after comparison in this session — recommended as a follow-up once
real large photos are actually uploaded.

## 6. Gallery mobile-browser-bar behavior

**NUMBER:** 5
**TASK:** Make Gallery's fullscreen viewer feel like Menu's.
**OWNER:** Needs owner confirmation (this was investigated, not newly built)
**STATUS:** PARTIAL — investigated, no code difference found
**WHAT WE FOUND:** Gallery and Menu already share the exact same fullscreen
viewer component (from earlier work this month), so there is no code-level
difference between them today that would explain different browser-bar
behavior. The most likely explanation is that Feston was testing an older,
cached version of the Gallery page before that unification shipped.
**WHY WE DIDN'T CHANGE ANYTHING FURTHER:** We don't invent a fix for a
difference we can't reproduce in the code. A browser's address bar/bottom
bar collapsing on scroll is controlled by the browser itself, not something
a website can force — we did confirm the viewer already uses the
standards-correct approach (`100dvh`, scroll-locked while open).
**NEXT STEP:** Please re-test Gallery vs Menu on an actual phone against
the current production site (after this deploys) and report back if the
difference still exists — that would mean something more specific we
haven't spotted yet.

## 7. Railway migration / Vercel retirement

**NUMBER:** 6
**TASK:** Move production to Railway, then delete the Vercel project.
**OWNER:** Needs owner confirmation
**STATUS:** NOT STARTED (deployment itself) / BLOCKED (Vercel deletion)
**WHAT WE FOUND:** The codebase already has Railway-compatible
configuration (`railway.json`, a `DATA_DIR` setting for persistent storage)
from earlier work, but there is no evidence a live Railway project actually
exists yet — I have no access to a Railway account/dashboard from this
session to check or create one.
**WHY IT'S NOT STARTED:** Actually creating and verifying a Railway
deployment (persistent volume, environment variables, admin login,
uploads, backups) requires someone with Railway account access to either
do it or grant this session a connected tool for it. I will not claim
Railway is "ready" without being able to test it end-to-end.
**WHY VERCEL IS NOT DELETED:** Per the task's own instruction, Vercel must
only be removed after Railway is fully verified — which hasn't happened
yet. Deleting a Vercel project is irreversible.
**MANUAL STEPS STILL NEEDED:**
1. Create/connect a Railway project to this GitHub repo.
2. Attach a persistent volume and set `DATA_DIR` to its mount path.
3. Set `ADMIN_SECRET` and `ADMIN_PASSWORD` in Railway's environment
   variables (strong, unique values — not the ones used anywhere else).
4. Deploy, then test Home/Menu/Gallery/Contact/Admin end-to-end, including
   an admin login + upload, then a restart, to confirm nothing resets.
5. Only after all of that passes: go to the Vercel dashboard →
   `taverna-menata` project → Settings → delete project. (Not
   `taverna-menata-blbe` — that belongs to someone else.)

## 8. Professional business email — recommendation (not created)

**NUMBER:** 7
**TASK:** Suggest a professional business email address.
**OWNER:** Needs owner confirmation (decision, not implementation)
**STATUS:** NOT STARTED (no domain-backed mailbox was created — see why)
**RECOMMENDATION:**
- Best address: `info@<menata-domain>` (most versatile for general
  business contact — press, partners, customers).
- Alternatives: `contact@<menata-domain>` or `partners@<menata-domain>`
  if you want to separate general inquiries from business partnerships.
- Provider: Google Workspace or Microsoft 365, through whoever registered
  the Menata domain — both offer custom-domain mailboxes with calendar and
  file storage bundled in, and are the two options most marketing/business
  contacts expect.
- Security: a unique strong password (never reused), 2FA or a passkey
  turned on immediately, and a recovery email/phone controlled by the
  business owner — never shared over WhatsApp or chat.
**WHY WE DIDN'T CREATE ONE:** We don't have confirmed ownership of a Menata
domain or mailbox-hosting account in this session, and creating a real
mailbox needs billing/ownership decisions only the business owner can make.

## 9. Backups / persistence

**NUMBER:** 8
**TASK:** Backups and persistent storage.
**OWNER:** Eros
**STATUS:** PARTIAL
**WHAT EXISTS TODAY:** The committed `backend/menata.db` is itself a form
of backup — it's the known-good menu/gallery/settings content, re-created
automatically every time the server starts if the live database is ever
lost (e.g. a cold start on Vercel resets `/tmp`). As of this session, that
file no longer contains live credentials or sessions, only public content.
**WHAT'S STILL MISSING:** An actual scheduled backup of *admin-entered*
changes (new menu items typed into the admin panel, new photos uploaded,
etc.) does not exist yet — on Vercel today, those changes are already lost
on every cold start (a known limitation, not new). Moving to Railway with a
persistent volume (see task 6) fixes the "lost on restart" problem, but a
real scheduled backup (e.g. a nightly copy of the database file to cloud
storage) is a separate task we have not built.
**WHY MENATA NEEDS THIS:** Without it, a bad edit, an accidental delete, or
a server/disk failure on Railway could permanently lose real admin-entered
content with no way to recover it — a periodic, kept-elsewhere-from-the-
server backup is the only protection against that.
**RECOMMENDATION:** Once Railway is confirmed working with persistent
storage, add a daily scheduled job that copies the database file to a
separate storage location (e.g. a cloud storage bucket), and test restoring
from it at least once before relying on it.

---

## Commits

(Filled in after the work in this session was committed and pushed — see
the final report delivered in the conversation for the exact commit SHAs.)
