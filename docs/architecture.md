# Architecture

The architecture of DAYVAULT is built using modern web standards for a secure, responsive, and server-rendered application.

## Stack
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui
- **Backend:** Next.js Server Actions & API Routes, Node.js runtime
- **Database & Services:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel-ready

## Architecture Diagram

```mermaid
graph TD;
    Browser -->|HTTPS| Nextjs[Next.js App Router];
    Nextjs -->|Server Actions / API| Node[Node.js Server Environment];
    Node -->|Auth, Postgres, Storage| Supabase[Supabase Managed Services];
    Supabase --> PostgreSQL[PostgreSQL Database];
    Supabase --> Storage[Supabase Storage (journal_photos bucket)];
    Supabase --> Auth[Supabase Authentication];
```

## Data Flow

1. **Page Loads**: Client requests pages from Next.js server. Middleware (`middleware.ts`) refreshes Supabase session and protects `/(dashboard)` routes.
2. **Server Components**: Next.js server dynamically renders pages (no static generation), fetching data directly from Supabase via Server Client (`@/lib/supabase/server`).
3. **Client Interactivity**: Client Components (`'use client'`) handle forms, photo uploads, calendar interaction, search debounce. They call Server Actions for mutations or upload directly to Supabase Storage.
4. **Mutations**: 
   - Journal/Plan CRUD: Server Actions (`app/actions/journal.ts`, `plan.ts`) with Zod validation.
   - Photo Upload: Client → Supabase Storage directly (RLS enforced), then Server Action saves `photo_url` to `photos` table.
   - Auth: Server Actions (`app/(auth)/actions.ts`) for login/signup/logout.
5. **Real-time**: Not implemented (no Supabase Realtime subscriptions).

## Key Patterns

- **Server-First**: Data fetching in Server Components; minimal Client Components.
- **Route Groups**: `/(auth)` public, `/(dashboard)` protected via middleware.
- **Colocated Actions**: Server Actions in `app/actions/` and `app/(auth)/actions.ts`.
- **Type-Safe DB**: Generated types in `types/supabase.ts` from Supabase schema.