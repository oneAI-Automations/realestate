# Elite Estates — Luxury Real Estate Portal

A high-end "Luxury Noir" real estate web app for Pune builders. Deep black, gold accents, white typography. Built with React + Vite, Express, PostgreSQL, and Supabase Auth.

---

## Connecting Your API Keys

### 1. Supabase (Admin Authentication + Properties)

You need a free [Supabase](https://supabase.com) project.

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In your project dashboard, go to **Project Settings → API**.
3. Copy your **Project URL** and **anon/public key**.
4. In Replit, open the **Secrets** panel (lock icon) and add:

| Secret Key | Value |
|---|---|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key) |

### 2. Create Your Admin User

1. In your Supabase dashboard, go to **Authentication → Users**.
2. Click **Add user → Create new user**.
3. Enter your email and a strong password.
4. Use those credentials at `/login` to access the admin dashboard.

---

## Supabase Table Schema (SQL)

Run this in **Supabase Dashboard → SQL Editor → New query**:

```sql
-- Properties table (supports multiple images, description, location, contact)
CREATE TABLE properties (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title          TEXT NOT NULL,
  price          TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'Available',
  location       TEXT,
  description    TEXT,
  contact_number TEXT,
  images         TEXT[] DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON properties FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin write"
  ON properties FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Global amenities (shown on homepage + linked to properties)
CREATE TABLE amenities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  icon       TEXT NOT NULL DEFAULT '✦',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON amenities FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin write"
  ON amenities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Junction table: which amenities belong to which property
CREATE TABLE property_amenities (
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id  UUID REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"
  ON property_amenities FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin write"
  ON property_amenities FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

---

## Storage Bucket (for photo uploads)

In **Supabase → Storage → New bucket**:
- Name: `property-images`
- Tick **Public bucket** → Create

---

## Features

### Public Interface
- **Hero section** — full-viewport cinematic background, Playfair Display heading, WhatsApp CTA
- **Marquee banner** — scrolling special offer text, editable from admin
- **Featured Properties** — pulled live from Supabase, click any card to open detail overlay
- **Amenities section** — live from Supabase `amenities` table, shown as emoji icon grid
- **Properties page** — all listings with Available / Sold Out filter, click to view details
- **Property Detail Overlay** — 90% screen modal with image gallery slider, description, location, contact agent section with phone + WhatsApp button, property-specific amenities

### Admin Dashboard (`/login` → `/admin`)
- Protected by Supabase Auth (email + password)
- **Properties tab** — full CRUD: title, price, location, status, description, contact number, up to 15 photo uploads, amenities checklist
- **Amenities tab** — add/delete global amenities with emoji icon + name
- **Banner tab** — edit the homepage scrolling marquee text
- Live stats: Total / Available / Sold Out / Featured counts

---

## Customization

| What to change | Where |
|---|---|
| WhatsApp number | Search for `wa.me/919999999999` in `src/pages/` and `src/components/` |
| Site name / branding | `src/components/Navbar.tsx`, footer in `src/pages/Home.tsx` |
| Hero background image | `src/pages/Home.tsx` — backgroundImage URL |
| Color palette | `src/index.css` — CSS variables |
| Gold color (#D4AF37) | Global search and replace |

---

## Running Locally (Replit)

Everything runs via Replit Workflows automatically. The three services are:

- **Frontend** — Vite dev server at `/`
- **API Server** — Express at `/api`
- **Database** — Replit-managed PostgreSQL (auto-connected, used for banner only)
- **Properties/Amenities** — Supabase PostgreSQL
- **Photo Storage** — Supabase Storage (`property-images` bucket)
