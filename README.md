# Elite Estates — Luxury Real Estate Portal

A high-end "Luxury Noir" real estate web app for Pune builders. Deep black, gold accents, white typography. Built with React + Vite, Express, PostgreSQL, and Supabase Auth.

---

## Connecting Your API Keys

### 1. Supabase (Admin Authentication)

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

The property data lives in **Replit's own PostgreSQL** (not Supabase). If you ever want to migrate to Supabase DB, here is the equivalent schema:

```sql
-- Properties table
CREATE TABLE properties (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  location    TEXT NOT NULL,
  price       TEXT NOT NULL,
  bedrooms    INTEGER NOT NULL,
  bathrooms   INTEGER NOT NULL,
  area_sqft   INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_url   TEXT,
  is_sold_out BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  property_type TEXT NOT NULL DEFAULT 'Apartment',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Site settings (special offer banner)
CREATE TABLE site_settings (
  id         SERIAL PRIMARY KEY,
  text       TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Features

### Public Interface
- **Hero section** — full-viewport cinematic background, Playfair Display heading, WhatsApp CTA
- **Marquee banner** — scrolling special offer text, editable from admin
- **Featured Properties** — pulled live from the database
- **Amenities section** — Gym, Parking, Garden, Pool, Security, Concierge with gold icons
- **Properties page** — all listings with Available / Sold Out filter

### Admin Dashboard (`/login` → `/admin`)
- Protected by Supabase Auth (email + password)
- Edit property name, price, location, type, bedrooms, bathrooms, area, image URL, description
- Toggle Sold Out / Available status instantly
- Add new properties, delete existing ones
- Update the homepage marquee banner text
- Live stats: Total / Available / Sold Out / Featured counts

---

## Customization

| What to change | Where |
|---|---|
| WhatsApp number | Search for `wa.me/919999999999` in `src/pages/` |
| Site name / branding | `src/components/Navbar.tsx`, footer in `src/pages/Home.tsx` |
| Hero background image | `src/pages/Home.tsx` — backgroundImage URL |
| Amenities list | `src/pages/Home.tsx` — `amenities` array |
| Color palette | `src/index.css` — CSS variables |
| Gold color (#D4AF37) | Global search and replace |

---

## Running Locally (Replit)

Everything runs via Replit Workflows automatically. The three services are:

- **Frontend** — Vite dev server at `/`
- **API Server** — Express at `/api`
- **Database** — Replit-managed PostgreSQL (auto-connected)
