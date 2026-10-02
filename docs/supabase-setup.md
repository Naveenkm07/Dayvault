# Supabase Setup Guide

## 1. Create a Supabase Project
Go to [supabase.com](https://supabase.com) and create a new project.

## 2. Copy Environment Variables
Navigate to Project Settings > API. Copy your URL and anon key into `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Apply SQL Migrations
Go to the SQL Editor in Supabase and run the migration files located in `supabase/migrations/20240101000000_init.sql` to create tables, indexes, and RLS policies.

## 4. Configure Storage
Run `docs/setup-storage.sql` in SQL Editor to create the **`journal_photos`** bucket (public) and storage RLS policies.

**Note**: The bucket name is `journal_photos` (not `dayvault-photos` as referenced in some older docs).

## 5. Configure Authentication
Navigate to Authentication > Providers. Enable Email/Password authentication. Configure redirect URLs for your local environment (e.g. `http://localhost:3000/auth/callback`) and production (your Vercel domain).

## 6. Verify RLS Policies
Ensure these tables have policies:
- `profiles` - ✅ "Users can manage their own profile"
- `daily_entries` - ✅ "Users can manage their own entries"
- `plans` - ✅ "Users can manage their own plans"
- `photos` - ✅ "Users can manage their own photos"
- `tags` - ⚠️ **MISSING** - No policies created (RLS enabled but no policies)
- `entry_tags` - ⚠️ **MISSING** - No policies created (RLS enabled but no policies)

## 7. Run the App Locally
Run `npm run dev` and navigate to `http://localhost:3000` to register your first user.