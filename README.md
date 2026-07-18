# WeddingInvite

A multi-tenant wedding RSVP platform. You (the Super Admin) create a wedding and
a login for each couple. They add guests and send invite links over WhatsApp.
Guests tap the link, RSVP, and everything shows up live on the couple's
dashboard — guest list, plus-one requests, seating chart, and a check-in mode
for the wedding day.

No email sending is used anywhere. Invite links are shared by the couple
themselves, one tap opens WhatsApp with the message pre-filled.

---

## 1. Create your Supabase project (the database + login system)

1. Go to https://supabase.com and sign up (free tier is enough to start).
2. Click **New project**. Pick any name and a strong database password (save it somewhere safe — you won't need it day to day).
3. Wait about two minutes for the project to finish setting up.
4. In the left sidebar, go to **SQL Editor** → **New query**.
5. Open the file `supabase/schema.sql` from this project, copy its entire contents, paste it into the SQL editor, and click **Run**.
   - This creates every table, security rule, and function the app needs. You only do this once.
6. In the left sidebar, go to **Project Settings** → **API**. You'll need three values from this page in the next step:
   - **Project URL**
   - **anon public** key
   - **service_role** key (click "reveal" — keep this one secret, never share it)

## 2. Create your own Super Admin account

1. In Supabase, go to **Authentication** → **Users** → **Add user** → **Create new user**.
2. Enter your own email and a password. Tick "Auto confirm user".
3. Go back to **SQL Editor** → **New query** and run this, replacing the email with yours:

```sql
update profiles set role = 'super_admin'
where id = (select id from auth.users where email = 'you@example.com');
```

That's it — that account can now sign in and manage every wedding on the platform.

## 3. Run it locally first (recommended)

You'll need [Node.js](https://nodejs.org) installed (version 18 or higher).

1. Open a terminal in this project folder.
2. Copy `.env.example` to `.env.local` and fill in the three Supabase values from step 1, plus:
   `NEXT_PUBLIC_APP_URL=http://localhost:3000`
3. Run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:3000 and sign in with the Super Admin account you created.

## 4. Deploy it so guests and couples can actually use it

The easiest path is **Vercel** (built by the same people as Next.js, free tier is enough to start):

1. Push this project to a GitHub repository (create one on github.com, then follow GitHub's instructions to push this folder to it).
2. Go to https://vercel.com, sign up, and click **Add New Project**. Select your GitHub repository.
3. Before clicking Deploy, open **Environment Variables** and add the same four values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` → set this to the address Vercel will give your site, e.g. `https://weddinginvite.vercel.app` (you can update it after the first deploy once you know the exact URL, then redeploy)
4. Click **Deploy**. In a couple of minutes you'll have a live URL.
5. If you want your own domain (e.g. `invites.yourbrand.com`), add it under the project's **Domains** tab in Vercel and follow the on-screen DNS instructions, then update `NEXT_PUBLIC_APP_URL` to match and redeploy.

## 5. Day-to-day use

**As Super Admin:**
- Sign in → **New wedding** → enter the couple's names, an email, and a temporary password for them → **Create wedding**. Share that email/password with the couple directly (WhatsApp, in person, however you like).
- From a wedding's page you can activate/deactivate it, reset the couple's password, view recent activity, or manage their guests yourself if they need help.

**As a couple:**
- Sign in with the email/password you were given.
- **Guests** — add people one at a time, or upload a CSV (spreadsheet) with columns `name`, `phone`, `category`. Click **Send via WhatsApp** next to any guest to open WhatsApp with their personal invite link already typed in — just hit send.
- **Seating** — once guests RSVP yes, drag them onto tables.
- **Check-in** — open this on a phone or tablet at the venue entrance on the day; search a name and tap to mark arrived.
- **Theme & details** — pick a preset or your own colors, set the date, venue, dress code, and the welcome message guests see.

**As a guest:**
- Tap the WhatsApp link → lands on a page styled to the couple's theme → picks a response → done. No login, no app.

## Notes on how data is kept separate

Every couple's data is walled off at the database level (Row Level Security),
not just in the app's screens — so even a bug in the interface can't leak one
couple's guest list to another. Only your Super Admin account can see across
all weddings.

## If something needs changing later

This is a real Next.js + Supabase codebase — any developer (or Claude) can pick
it up and extend it. The structure:
- `supabase/schema.sql` — the entire database, one file
- `src/app/super-admin/*` — your admin console
- `src/app/dashboard/*` — the couple's dashboard
- `src/app/rsvp/[token]/*` — the public guest page
- `src/lib/guestActions.ts` — the actions both of the above call into
