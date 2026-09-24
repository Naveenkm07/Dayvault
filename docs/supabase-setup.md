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
Go to the SQL Editor in Supabase and run the migration files located in `supabase/migrations/` (if any), or use the contents of `docs/setup-storage.sql` to initialize your schemas and buckets.

## 4. Configure Storage Policies
Ensure the `dayvault_photos` bucket exists and has the appropriate Row Level Security (RLS) policies. Only authenticated users should upload or select their own files.

## 5. Configure Authentication
Navigate to Authentication > Providers. Enable Email/Password authentication. Configure redirect URLs for your local environment (e.g. `http://localhost:3000/auth/callback`).

## 6. Run the App Locally
Run `npm run dev` and navigate to `http://localhost:3000` to register your first user.
