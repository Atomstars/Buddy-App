# Step 1 — Foundation: Auth + Per-User Data Isolation

## What changed in code
- **Guest login is now a real anonymous Supabase user** (`signInAnonymously`) instead of a
  fake mock with UUID `0000…0000`. Real `auth.uid()` → Row Level Security works → each
  guest/user gets their own isolated data. (`src/hooks/useAuth.js`)
- **Supabase keys read from env** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) with the
  old values kept as fallback. (`src/utils/supabaseClient.js`, `.env.example`)
- Removed the fragile localStorage mock-session race logic.
- Guest button now surfaces a clear error if anonymous sign-ins are disabled.

## What YOU must do in the Supabase dashboard (one time)

1. **Enable Anonymous sign-ins**
   - Dashboard → Authentication → Sign In / Providers → toggle **"Allow anonymous sign-ins"** ON.
   - Without this, "Continue as Guest" will fail with a clear in-app message.

2. **Make sure the RLS isolation migration is applied**
   - Dashboard → SQL Editor → run the contents of
     `supabase/migrations/20260530000001_user_isolation.sql` (safe to re-run; it uses
     IF NOT EXISTS / DROP POLICY IF EXISTS).
   - This adds `user_id` columns + enables RLS so users can only see their own rows.

3. **(Recommended) Email confirmation setting**
   - Dashboard → Authentication → Sign In / Providers → Email.
   - If **"Confirm email"** is ON: after sign-up the user must click an email link before a
     session exists — the app already shows "Account created! Check your email."
   - If OFF: sign-up logs the user straight in. Either is fine; just know which you picked.

## How to verify
- `node test_anonymous_auth.js` → should print "Anonymous sign-in succeeded!"
- In the app: "Continue as Guest" → you land in onboarding/home, and any expense/task you
  add persists and is visible only to that guest.
- Sign out, guest in again → fresh empty slot (a NEW anonymous user each time).

## Optional later
- "Upgrade" an anonymous guest into a permanent account by linking email/password
  (`supabase.auth.updateUser`) so guests don't lose data. Parked for now.
