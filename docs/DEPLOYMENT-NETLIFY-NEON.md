# Deploy to Netlify + Neon

Guide for putting **Coplanar Comics Trading Cards** into production with:

- **Netlify** — hosts the Next.js app
- **Neon** — free-tier Postgres for sign-in sessions and saved collections
- **NextAuth** — Google / Facebook OAuth (Google recommended first)

---

## What I need from you

Complete these **before** the first production deploy. You can do them in parallel.

| # | What | Who | Notes |
|---|------|-----|-------|
| 1 | **Netlify account** + Git repo connected | You | Push this repo to GitHub/GitLab/Bitbucket |
| 2 | **Neon account** (free) | You | [neon.com](https://neon.com) — no credit card |
| 3 | **Production site URL** | You | e.g. `https://coplanar-cards.netlify.app` or custom domain |
| 4 | **`NEXTAUTH_SECRET`** | You | Run locally: `openssl rand -base64 32` (or any 32+ char random string) |
| 5 | **Neon connection string(s)** | You | Copy from Neon dashboard (see Step 1 below) |
| 6 | **Google OAuth app** (recommended first) | You | Client ID + secret from Google Cloud Console |
| 7 | **Facebook OAuth** (optional) | You | Only if you want that button live on day one |
| 8 | **Confirm dev tools off in prod** | You | Do **not** set `DEV_AUTH_BYPASS` or `ENABLE_CARD_EDITOR` on Netlify |

**Send / paste to yourself (never commit secrets):**

```env
DATABASE_URL=postgresql://...@...neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://YOUR-SITE.netlify.app
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
```

Optional later:

```env
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

**Decisions only you can make:**

- Custom domain now or later?
- Which OAuth providers at launch? (Start with **Google only** is fine.)
- One Neon project with **dev + production branches**, or separate projects?

---

## Architecture (what happens where)

```
Browser
  → Netlify (Next.js 15, serverless functions)
      → NextAuth  (/api/auth/*)     → Neon (User, Account, Session)
      → Pack open   (/api/packs/*)  → Neon (UserCard, PackOpened, Card)
      → Collection  (/api/collection) → Neon
      → Play roster (signed in)     → Neon (owned cards)

Card catalog content (names, stats, art paths) → JSON in repo + static assets
Guest play / guest pack open → works without DB writes
Signed-in play / collection  → requires Neon
```

---

## Step 1 — Create Neon database

1. Sign up at [neon.com](https://neon.com) (Free plan).
2. **Create a project** (e.g. `coplanar-cards`).
3. Open the project → **Dashboard** → copy the **connection string** (PostgreSQL, pooled recommended for serverless).
4. Ensure the URL includes `?sslmode=require`.

**Recommended:** create two branches in the same project:

| Branch | Use |
|--------|-----|
| `main` | Netlify production (`DATABASE_URL` in Netlify env) |
| `dev` | Your local `.env` for development |

Neon → **Branches** → **Create branch** → name it `dev`.

---

## Step 2 — Apply database schema

The repo includes Prisma migrations under `prisma/migrations/`.

### One-time: production (Neon `main` branch)

From your machine (with production `DATABASE_URL` in the shell, **not** committed):

```bash
# PowerShell — set for this session only
$env:DATABASE_URL="postgresql://USER:PASS@HOST/neondb?sslmode=require"

npm run db:migrate
```

Or let Netlify run it automatically on deploy (`netlify.toml` runs `prisma migrate deploy` before `next build`).

### Local development

1. Copy `.env.example` → `.env`
2. Set `DATABASE_URL` to your Neon **dev** branch connection string
3. Run:

```bash
npm run db:migrate:dev
```

4. Start the app:

```bash
npm run dev
```

**Note:** Local dev no longer uses SQLite. Both local and production use Postgres via Neon.

---

## Step 3 — Connect repo to Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
2. Select this repository
3. Netlify should detect Next.js via `netlify.toml`:

   - **Build command:** `npx prisma migrate deploy && npm run build`
   - **Plugin:** `@netlify/plugin-nextjs` (auto-installed on first build)
   - **Publish directory:** leave **empty** (do not set `.next` in the UI — the plugin handles output)

4. **Do not deploy yet** — add environment variables first (Step 4).

---

## Step 4 — Netlify environment variables

**Site settings → Environment variables → Add variable**

Set for **Production** (and **Deploy previews** if you want OAuth on preview URLs — see below).

### Required

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon **main** branch connection string |
| `NEXTAUTH_URL` | `https://YOUR-SITE.netlify.app` (no trailing slash) |
| `NEXTAUTH_SECRET` | Output of `openssl rand -base64 32` |

### OAuth — start with Google

| Variable | Value |
|----------|--------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

### Must NOT be set in production

| Variable | Why |
|----------|-----|
| `DEV_AUTH_BYPASS` | Dev-only fake sign-in |
| `NEXT_PUBLIC_DEV_AUTH_BYPASS` | Shows dev sign-in button |
| `ENABLE_CARD_EDITOR` | `/editor` is dev-only |
| `NEXT_PUBLIC_ENABLE_CARD_EDITOR` | Same |

If these are unset, production correctly disables dev bypass and the card editor.

---

## Step 5 — Google OAuth setup

1. [Google Cloud Console](https://console.cloud.google.com/) → create or select a project
2. **APIs & Services → OAuth consent screen**
   - User type: **External** (unless Workspace-only)
   - App name, support email, developer contact
   - Scopes: `email`, `profile`, `openid` (defaults are fine)
   - Add your email as a **test user** while app is in "Testing"
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Type: **Web application**
   - **Authorized JavaScript origins:**
     - `https://YOUR-SITE.netlify.app`
     - `http://localhost:3000` (local dev)
   - **Authorized redirect URIs:**
     - `https://YOUR-SITE.netlify.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
4. Copy **Client ID** and **Client secret** into Netlify env vars (and local `.env` for dev)

**Publish app:** when ready for any Google user, OAuth consent screen → **Publish app**.

---

## Step 6 — Facebook OAuth (optional)

1. [developers.facebook.com](https://developers.facebook.com/) → **My Apps → Create App**
2. Add **Facebook Login** product
3. **Valid OAuth Redirect URIs:**
   - `https://YOUR-SITE.netlify.app/api/auth/callback/facebook`
   - `http://localhost:3000/api/auth/callback/facebook`
4. Copy **App ID** → `FACEBOOK_CLIENT_ID`, **App Secret** → `FACEBOOK_CLIENT_SECRET`

App must be **Live** (not Development) for public users.

---

## Step 7 — Deploy and verify

1. Trigger deploy on Netlify (**Deploys → Trigger deploy**)
2. Watch build log — expect:
   - `prisma migrate deploy` → success
   - `next build` → success
3. Smoke test on production URL:

| Test | Expected |
|------|----------|
| Home loads | No 500 errors |
| Sign in with Google | Redirects back, name shown in header |
| Open pack (signed in) | Cards revealed; `savedToCollection: true` in network tab |
| `/collection` | Shows owned cards (not 401) |
| `/play` | Roster limited to owned cards when signed in |
| Open pack (signed out) | Works but cards not saved |
| `/editor` | 404 in production |

### If deploy fails with `request body too large` / `___netlify-server-handler`

The **build can succeed** while **deploy** fails — that means the serverless function bundle is too big, not a Prisma or Next.js compile error.

Common causes in this repo:

- **Publish directory set to `.next` in Netlify UI** — clear it (Site settings → Build & deploy → Publish directory → empty). `@netlify/plugin-nextjs` manages deploy output.
- **Large card PNGs** (~280 MB in `public/assets/cards/`) must stay **static assets**, not bundled into the server function. The repo excludes them via `outputFileTracingExcludes` in `next.config.ts`.
- **`data/team_rankings.json`** is a local test artifact (~80 MB) and must not be committed.

Do **not** upgrade to Prisma 7 to fix this — it is unrelated.

### If sign-in fails

- `NEXTAUTH_URL` must exactly match the browser URL (https, no trailing slash)
- Google redirect URI must match exactly
- Check Netlify **Functions** log for NextAuth errors
- Confirm `DATABASE_URL` is reachable from Netlify (Neon IP allowlist is usually open by default)

### If packs fail after sign-in

- Usually `DATABASE_URL` missing/wrong or migrations not applied
- Run `npm run db:migrate` locally against prod URL once to confirm connectivity

---

## Step 8 — Custom domain (optional)

1. Netlify → **Domain management** → add domain
2. Update DNS per Netlify instructions
3. Update **`NEXTAUTH_URL`** to `https://yourdomain.com`
4. Add the new domain to Google (and Facebook, if enabled) **origins** and **redirect URIs**
5. Redeploy

---

## Managing users and collections

There is **no in-app admin panel** today.

| Task | How |
|------|-----|
| See who signed up | Neon dashboard → SQL, or `npm run db:studio` with prod `DATABASE_URL` |
| Inspect a user's cards | Prisma Studio → `UserCard` table filtered by `userId` |
| Grant cards manually | Insert/update rows in `UserCard` (or build admin later) |
| Update card catalog | Edit JSON in repo (`data/*`), redeploy; catalog syncs on pack open |
| Reset a user's collection | Delete their `UserCard` rows (keep `User` if they should stay signed in) |

**Prisma Studio (read/write UI):**

```bash
$env:DATABASE_URL="postgresql://..."   # prod or dev — be careful
npm run db:studio
```

---

## Local vs production summary

| | Local (`.env`) | Netlify (production) |
|--|----------------|----------------------|
| `DATABASE_URL` | Neon **dev** branch | Neon **main** branch |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-site.netlify.app` |
| `DEV_AUTH_BYPASS` | `true` OK | **unset** |
| `ENABLE_CARD_EDITOR` | `true` OK | **unset** |
| OAuth redirect | `localhost:3000/...` | `your-site.netlify.app/...` |

---

## Deploy previews (optional)

If Netlify **Deploy Previews** are enabled, each PR gets a unique URL. OAuth providers require **each preview URL** registered as redirect URI — impractical for Google/Facebook.

**Recommendation:** use production URL for OAuth testing; use **dev bypass** only locally for feature work.

---

## Cost expectations

| Service | Typical cost for this app |
|---------|---------------------------|
| **Neon Free** | $0 — enough for early users |
| **Netlify Free** | $0 — hobby tier with bandwidth limits |
| **Google OAuth** | $0 |
| **Facebook OAuth** | $0 |

Neon free tier cold-starts after ~5 min idle (first DB request may be ~1–2s slower).

---

## Checklist — copy before go-live

```
[ ] Neon project created (main + dev branches)
[ ] prisma migrate applied to main branch
[ ] Repo connected to Netlify
[ ] DATABASE_URL set on Netlify
[ ] NEXTAUTH_URL set to production URL
[ ] NEXTAUTH_SECRET generated and set
[ ] GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET set
[ ] Google redirect URI includes /api/auth/callback/google
[ ] DEV_AUTH_BYPASS not set on Netlify
[ ] ENABLE_CARD_EDITOR not set on Netlify
[ ] Deploy succeeded
[ ] Google sign-in works
[ ] Signed-in pack save works
[ ] Collection page loads
```

---

## Repo changes already made for this plan

- `prisma/schema.prisma` — switched from SQLite to **PostgreSQL**
- `prisma/migrations/` — initial migration for Neon
- `netlify.toml` — migrate + build + Next.js plugin
- `package.json` — `postinstall` / build runs `prisma generate`
- `.env.example` — updated for Neon connection string format

After you create Neon and fill in `.env`, run `npm run db:migrate:dev` once locally, then connect Netlify and deploy.

---

## Getting help

If something breaks during setup, note:

1. Netlify deploy log (build + function errors)
2. Browser network tab on failed sign-in (`/api/auth/...`)
3. Whether the issue is local-only or production-only

Common fix: mismatch between `NEXTAUTH_URL` and the URL in the browser.
