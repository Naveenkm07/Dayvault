# Deployment Guide

DAYVAULT is designed to be effortlessly deployable to Vercel.

## 1. Create a GitHub Repository
Initialize a git repository if you haven't already and push the source code to GitHub.

## 2. Import into Vercel
Go to [vercel.com](https://vercel.com) and click "Add New... Project". Import your newly created GitHub repository.

## 3. Configure Environment Variables
In the Vercel project settings during setup, add your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. ⚠️ Build Configuration Note
**Current `next.config.ts` has `ignoreBuildErrors: true`** - this masks TypeScript errors during build. Before production deploy:
1. Set `ignoreBuildErrors: false` (or remove the option)
2. Run `npm run build` locally to fix any TypeScript errors
3. Re-enable if needed for deployment, but investigate errors first

## 5. Deploy
Click "Deploy". Vercel will run `npm run build` which dynamically renders pages and provisions Node.js serverless functions.

## 6. Configure Supabase Redirect URLs
Once deployed, copy your Vercel project domain (e.g., `https://dayvault.vercel.app`) and add it to your Supabase Auth > URL Configuration > Redirect URLs list to allow successful sign-ins on production.

## 7. Configure Supabase Storage CORS (if needed)
If photo uploads fail in production, check Supabase Storage > Settings > CORS and add your Vercel domain.

## 8. Verification
Test production authentication, database reads/writes (creating a journal entry), and photo uploads to ensure RLS policies and storage are correctly linked.