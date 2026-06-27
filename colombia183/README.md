# 183 — Deployment Guide

A Next.js web app for tracking Colombian tax residency under the 183-day rolling rule.

---

## What you need (all free to start)

| Service | Purpose | Cost |
|---|---|---|
| [Supabase](https://supabase.com) | Database + Auth | Free tier |
| [Vercel](https://vercel.com) | Hosting | Free tier |
| [Anthropic](https://console.anthropic.com) | AI email parsing | ~$0.01/parse |
| Domain (optional) | e.g. colombia183.com | ~$12/year |

---

## Step 1 — Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose a name (e.g. `colombia183`) and a strong database password
3. Wait ~2 minutes for the project to spin up
4. Go to **SQL Editor** → **New Query**
5. Paste the entire contents of `supabase/migrations/001_create_trips.sql` and click **Run**
6. Go to **Settings → API** and copy:
   - **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2 — Get Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account → **API Keys → Create Key**
3. Copy the key → this is your `ANTHROPIC_API_KEY`
4. Add a small amount of credits ($5 lasts a long time at ~$0.01/parse)

---

## Step 3 — Deploy to Vercel

### Option A: Deploy via GitHub (recommended)

1. Push this project to a GitHub repo:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/colombia183.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. In the **Environment Variables** section, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL     = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   ANTHROPIC_API_KEY            = sk-ant-your-key
   ```

4. Click **Deploy** — it will build and give you a URL like `colombia183.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts, then add env vars in the Vercel dashboard
```

---

## Step 4 — Configure Supabase Auth redirect URLs

1. In Supabase → **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL: `https://colombia183.vercel.app`
3. Add to **Redirect URLs**: `https://colombia183.vercel.app/**`

---

## Step 5 — Add a custom domain (optional)

1. Buy a domain at [Namecheap](https://namecheap.com) or [Cloudflare](https://cloudflare.com)
2. In Vercel → your project → **Settings → Domains** → add your domain
3. Follow Vercel's DNS instructions (usually takes <10 minutes)
4. Update Supabase Auth URLs to use your new domain

---

## Local development

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.local.example .env.local

# Start dev server
npm run dev
# Open http://localhost:3000
```

---

## File structure

```
colombia183/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login
│   ├── signup/page.tsx       # Sign up
│   ├── dashboard/
│   │   ├── page.tsx          # Server component (fetches data)
│   │   └── DashboardClient.tsx  # Interactive dashboard
│   ├── history/
│   │   ├── page.tsx
│   │   └── HistoryClient.tsx
│   └── api/
│       ├── trips/route.ts       # GET all, POST new trip
│       ├── trips/[id]/route.ts  # PUT update, DELETE trip
│       └── analyze-email/route.ts  # AI email parser
├── components/
│   ├── Navbar.tsx
│   ├── TripRow.tsx
│   ├── AddTripModal.tsx
│   └── EmailModal.tsx
├── lib/
│   ├── tax-logic.ts          # 183-day rolling calculator
│   ├── supabase-browser.ts   # Client-side Supabase
│   └── supabase-server.ts    # Server-side Supabase
├── middleware.ts             # Auth route protection
└── supabase/migrations/      # Database schema
```

---

## Architecture

- **Auth**: Supabase Auth (email + password). Users sign up, confirm email, then log in.
- **Data**: Each trip stored in Postgres via Supabase with Row Level Security — users can only see their own data.
- **API**: Next.js Route Handlers (server-side) for all data operations. The Anthropic API key never touches the browser.
- **Hosting**: Vercel Edge Network — fast globally.

---

## Disclaimer

This tool is for informational purposes only and does not constitute legal or tax advice. The 183-day threshold is defined in Article 10 of Colombia's Tax Code (Estatuto Tributario). Consult a Colombian tax professional for your specific situation.
