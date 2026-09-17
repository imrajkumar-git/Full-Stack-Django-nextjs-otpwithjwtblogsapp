# Rajkumar Aryal — Portfolio & Community Platform

Your two projects merged into one site, with a new skills page, a reworked
background, and blog cover images that upload from your own device.

```
combined-website/
├── frontend/   ← Next.js 14 app (App Router, Tailwind, three.js)
└── backend/    ← Django + DRF API (accounts, blog, reviews)
```

---

## What changed in this pass

### 1. New `/skills` page — "Technical Expertise"

Modelled on the reference recording you sent.

- **`components/SkillSphere.jsx`** — a drag-to-rotate globe of technology
  badges. Points are spread with a Fibonacci spiral so they never clump;
  badges are billboarded (they stay upright), fade and blur toward the far
  side, and are depth-sorted so the front ones sit on top. Dragging adds
  angular velocity and releasing lets it coast back to a slow idle spin.
  Arrow keys turn it too, and `prefers-reduced-motion` parks the idle spin.
- **`app/skills/page.js`** — the globe, four category tabs (Foundations,
  Languages, AI / ML, Tools) and a detail panel with a live skill count.
  Clicking a badge on the globe jumps to the category that contains it.
- **`data/skills.js`** — the dataset, merged from both projects' skill lists.
- **`components/TechIcon.jsx`** — maps icon keys to `react-icons` components
  (already a dependency, so no new packages and no external image requests).

### 2. Reworked background animation

`components/CosmicBackground.jsx` was a single flat starfield. It's now three
layers:

1. an **aurora shader** — domain-warped fbm noise in your emerald/sky palette,
   concentrated into ribbons rather than washing the whole screen;
2. **three parallax star layers** drifting at different speeds and depths;
3. a faint **horizon grid** that gives the scene a floor.

The camera and star layers ease toward the pointer, so moving the mouse shifts
the parallax. It fades in on load rather than popping on, pauses entirely when
the tab is hidden, and falls back to a still frame under reduced-motion. A fine
inline noise texture over the top stops the gradients banding on dark screens.

### 3. Blog cover images upload from your device

**Backend**

- `Post.cover_image` — an `ImageField` stored at
  `media/blog_covers/<author id>/<slug>.<ext>`, with size and file-type
  validation. The old `cover_image_url` is kept so existing posts still work.
- Serializers expose a single **`cover`** field — an absolute URL that resolves
  the uploaded file first and falls back to the external URL. That's the only
  field the frontend reads.
- `PostViewSet` accepts `multipart/form-data` alongside JSON.
- Replacing or clearing an image deletes the old file, and deleting a post
  removes its cover, so `media/` doesn't fill with orphans.
- Send `remove_cover_image=true` to clear a stored image.
- Migration: `blog/migrations/0002_post_cover_image.py`.

**Frontend**

- `components/CoverImagePicker.jsx` — browse or drag-and-drop, live preview,
  replace/remove, and client-side checks that mirror the server's limits so
  people find out before the upload, not after.
- `/blog/new` and `/blog/[slug]/edit` post `FormData`.
- `lib/errors.js` turns DRF field errors into one readable sentence, so "that
  image is too large" actually reaches the author.

Change the limit in one place — `BLOG_COVER_MAX_BYTES` in `.env` — and mirror
it in `MAX_BYTES` at the top of `CoverImagePicker.jsx`.

### 4. Structure merged from the second project

- **`/projects`** — filterable case-study cards, `data/projects.js`.
- Homepage now shows **Selected Work** and pulls its **blog teaser from the
  live API** (`components/LatestPosts.jsx`) instead of the hardcoded
  `data/blogs.js`, which has been deleted. New posts appear there immediately,
  cover image included.
- Navbar gained Skills and Projects. With seven links the pill nav needed more
  room, so the desktop breakpoint moved from `md` to `lg`.

---

## ⚠️ Rotate your database password

`backend/core/settings.py` had live Neon Postgres credentials hardcoded in it
(`neondb_owner` / `npg_AGdVBOwQ40Te`). They're now read from environment
variables, but **that password was in the file you uploaded and should be
treated as compromised** — rotate it in your Neon dashboard and put the new one
in `backend/.env`.

Same applies to the Gmail app password flagged in the earlier merge, if you
haven't rotated it yet.

---

## Running it locally

**Backend — http://127.0.0.1:8000**

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # set SECRET_KEY and your DB credentials
                                  # or set DB_ENGINE=sqlite for a local file DB
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Frontend — http://localhost:3000**

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Register, verify the OTP (printed to the Django console if SMTP isn't
configured), then write a post at `/blog/new` and attach a cover from your
machine.

---

## Deploying

- **Frontend** → Vercel or any Next.js host. Set the `NEXT_PUBLIC_*_API_URL`
  vars to your deployed backend.
- **Backend** → Railway, Render, a VPS. Set `DEBUG=False`, a real `SECRET_KEY`,
  `ALLOWED_HOSTS`, and `CORS_ALLOWED_ORIGINS`/`FRONTEND_URL`.
- **Uploaded media is the thing to plan for.** Django only serves `/media/`
  when `DEBUG=True`. In production put covers on object storage (S3, Cloudflare
  R2, Supabase Storage) via `django-storages`, or serve `MEDIA_ROOT` from nginx.
  On a platform with an ephemeral filesystem, local uploads vanish on redeploy.
- Add the media host to `images.remotePatterns` in `next.config.mjs` if you
  switch the cover `<img>` tags to `next/image`.

## Verified

- `python manage.py check` and `makemigrations --check` are clean.
- Upload flow tested end to end against a running instance: create with an
  image → `201` with a real media URL; list and detail return it; removal
  clears it; an oversized file is rejected with a readable message.
- `npx next build` compiles with no errors — all 18 routes build.
