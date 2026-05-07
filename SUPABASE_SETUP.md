# Supabase Setup for Egg Tracker Deluxe

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project (or use an existing one)
3. Wait for the project to finish provisioning

## 2. Get Your API Keys

1. In the Supabase Dashboard, go to **Project Settings** → **API**
2. Copy:
   - **Project URL** → use as `VITE_SUPABASE_URL`
   - **anon public** key → use as `VITE_SUPABASE_ANON_KEY`

## 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and paste your values:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Run the Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Create a new query and paste the contents of `supabase/schema.sql`
3. Run the query

This creates:
- **profiles** – user id, email, name (extends auth.users)
- **egg_tray** – id, created_at, price, eggs_remaining
- **tray_consumption** – tray_id, user_id, eggs_consumed
- **tray_wastage** – tray_id, wasted_eggs (single row per tray)
- **tray_log** – date, tray_id, qty, user_id, note

## 5. Enable Email/Password Auth

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. (Optional) Disable **Confirm email** if you don't want email verification for sign in

## 6. Create Users (for now)

Since there's no sign-up page yet, create users manually:

1. Go to **Authentication** → **Users** → **Add user**
2. Enter email and password
3. (Optional) Add a row to `profiles` via SQL:

```sql
INSERT INTO public.profiles (id, email, name)
VALUES ('<user-uuid-from-auth>', 'user@example.com', 'User Name');
```

Or enable the `on_auth_user_created` trigger in `schema.sql` when you add sign-up.
