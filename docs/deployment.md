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

## 4. Deploy
Click "Deploy". Vercel will run `npm run build` which statically generates pages and provisions the Node.js serverless functions.

## 5. Configure Supabase Redirect URLs
Once deployed, copy your Vercel project domain (e.g., `https://dayvault.vercel.app`) and add it to your Supabase Auth > URL Configuration > Redirect URLs list to allow successful sign-ins on production.

## 6. Verification
Test production authentication, database reads/writes (creating a journal entry), and photo uploads to ensure RLS policies and storage are correctly linked.
