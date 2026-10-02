# DAYVAULT - Implementation Status

## 1. Architecture
- **Frontend/Backend:** Next.js 16 (App Router) serving as a full-stack framework.
- **Client:** React 19, Tailwind CSS v4, shadcn/ui for components.
- **Database/Auth/Storage:** Supabase (PostgreSQL, Auth, Storage).
- **Deployment:** Vercel-ready.

## 2. Technology Stack (Actual)
- Next.js 16.3.6 (App Router)
- React 19.2.8
- TypeScript 5 (Strict Mode)
- Tailwind CSS v4
- shadcn/ui (Radix UI primitives + @base-ui/react)
- Lucide React (Icons)
- Supabase (PostgreSQL, Auth, Storage) - @supabase/ssr, @supabase/supabase-js
- Zod 4 (Validation)
- React Hook Form 7 (Forms)
- date-fns 4 (Date manipulation)
- Sonner (Toasts)
- next-themes (Dark mode)
- Zustand 5 (Installed but **not used**)

## 3. Folder Structure (Actual)
```
/dayvault
  /app
    /(auth)
      /login
      /signup
      /forgot-password
    /(dashboard)
      /dashboard
      /journal
        /[id]
          /edit
        /new
      /calendar
      /plans
        /new
      /timeline
      /search
      /settings
    /api
      /search
      /export
    /auth
      /callback
    /layout.tsx
    /page.tsx
  /components
    /ui              (shadcn/ui components)
    /layout          (sidebar, header, user-menu, mobile-nav, nav-links)
    /journal         (journal-form, image-upload)
    /calendar        (calendar-client)
    /plans           (plan-form, plan-checkbox, delete-plan-button)
    /search          (search-client)
    /settings        (settings-client)
    /theme-toggle.tsx
    /theme-provider.tsx
  /lib
    /supabase
      client.ts
      server.ts
      middleware.ts
    /validators
      journal.ts
      plan.ts
    /utils.ts
    /hooks
      use-debounce.ts
  /types
    supabase.ts
  /hooks
  /public
  /docs
  /tests
  /supabase
    /migrations
```

## 4. Database Schema (Actual - from migration)
- **profiles:** `id` (references auth.users), `name`, `avatar_url`, `theme`, `accent_color`, `created_at`, `updated_at`.
- **daily_entries:** `id`, `user_id`, `entry_date`, `title`, `description`, `mood`, `location`, `created_at`, `updated_at`.
- **photos:** `id`, `user_id`, `entry_id`, `storage_path`, `public_or_signed_url_reference`, `caption`, `created_at`.
- **plans:** `id`, `user_id`, `plan_date`, `title`, `description`, `priority` (Low/Medium/High), `category`, `completed`, `created_at`, `updated_at`.
- **tags:** `id`, `user_id`, `name`, `color`, `created_at`. **(RLS enabled, NO policies)**
- **entry_tags:** `entry_id`, `tag_id`. **(RLS enabled, NO policies)**

**Indexes:** `idx_entries_user_date`, `idx_plans_user_date`

## 5. Authentication Flow
- Handled by Supabase Auth (Email/Password only - no OAuth yet).
- `app/auth/callback/route.ts` for setting up sessions.
- Middleware (`middleware.ts`) protects `/(dashboard)` routes, redirects unauthenticated to `/login`.
- Session management using `@supabase/ssr` (Server Components, Server Actions, Middleware).

## 6. Storage Strategy (Actual)
- Supabase Storage Bucket: `journal_photos` (not `dayvault-photos`).
- Bucket is **Public** (`public: true` in setup-storage.sql).
- Photos uploaded client-side directly to Supabase Storage via `getPublicUrl()`.
- RLS policies on storage.objects restrict upload/update/delete to own folder (`auth.uid()::text = (storage.foldername(name))[1]`).
- **No signed URLs used** - all photos publicly accessible via direct URL.

## 7. Page Structure (Actual)
- **Landing (/)**: Public overview, CTA to signup/login.
- **Auth (/(auth)/*)**: Login, Signup, Forgot Password (client-side forms with Server Actions).
- **Dashboard (/(dashboard)/dashboard)**: Stats cards, today's plans, recent entries (Server Component).
- **Journal (/(dashboard)/journal)**: List entries with photo count (Server Component).
- **Journal/Detail (/(dashboard)/journal/[id])**: Full entry with photos (Server Component).
- **Journal/Edit (/(dashboard)/journal/[id]/edit)**: Edit form with photo upload (Client Component).
- **Journal/New (/(dashboard)/journal/new)**: Create form (Client Component).
- **Calendar (/(dashboard)/calendar)**: Month view with entries/plans (Server Component + Client Calendar).
- **Timeline (/(dashboard)/timeline)**: Chronological grouped by year/month (Server Component).
- **Plans (/(dashboard)/plans)**: Grouped by date with checkboxes, priority badges, delete (Server Component).
- **Plans/New (/(dashboard)/plans/new)**: Create form (Client Component).
- **Search (/(dashboard)/search)**: Debounced client search via `/api/search` (Client Component).
- **Settings (/(dashboard)/settings)**: Profile, theme, accent color, data export (Server + Client).

## 8. API / Data Access Strategy (Actual)
- **Server Components**: Direct Supabase queries via `createClient()` from `@/lib/supabase/server`.
- **Server Actions**: Mutations in `app/actions/journal.ts`, `plan.ts`, `settings.ts`, `(auth)/actions.ts`.
- **Client Components**: Use `@/lib/supabase/client` for auth/upload; call Server Actions for mutations.
- **API Routes**: `/api/search` (GET, ilike on title/description), `/api/export` (GET, downloads all user data as JSON).
- **Validation**: Zod schemas in `lib/validators/` used in Server Actions.

## 9. Security Model (Actual)
- **Row Level Security (RLS)**: Enabled on profiles, daily_entries, plans, photos. **NOT on tags, entry_tags (no policies).**
- **Policies**: Users manage own data via `auth.uid() = user_id` (or `id` for profiles).
- **Storage RLS**: Users can only upload/update/delete in their own folder.
- **Validation**: Zod on all Server Action inputs.
- **Environment Variables**: Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exposed.
- **Middleware**: Refreshes session on every request, protects dashboard routes.
- **Gaps**: No rate limiting on auth; photos public via direct URL; tags/entry_tags unprotected.

## 10. Testing Strategy (Actual)
- **Playwright** configured (`playwright.config.ts`).
- **E2E Tests** (`tests/dayvault.spec.ts`): Basic UI existence checks (landing, login, signup, theme, journal/new, plans, search).
- **No unit tests** for validators, utilities, or Server Actions.
- **No integration tests** for database operations.
- **Test user**: Seed SQL uses placeholder UUID.

## 11. Deployment Strategy
- Hosted on Vercel.
- Environment variables in Vercel dashboard.
- GitHub integration for CI/CD.
- Build command: `npm run build` (with `ignoreBuildErrors: true` in next.config.ts).

## 12. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 13. Known Issues / Technical Debt
- `next.config.ts` has `ignoreBuildErrors: true` - masks TypeScript errors.
- Photo schema mismatch: code uses `photo_url` but DB has `public_or_signed_url_reference`; `user_id` and `storage_path` not set on insert.
- Tags system: DB tables exist but no UI, API, or Server Actions implemented.
- Calendar/Timeline/Search/Export fetch ALL records - no pagination (scalability risk).
- No error boundaries, no Suspense loading states.
- Duplicate form logic between journal-form and plan-form.
- Accent color saved to DB but not applied to CSS variables.
- Photo deletion removes DB record but not storage object (orphans).
- Search uses `ilike` without full-text indexes.
- Zustand installed but unused.

## 14. Future Improvements
- Google/GitHub OAuth integration.
- Mobile application (React Native / Expo).
- Rich text editor for journal entries.
- AI-based summaries of journal entries.
- Signed URLs for private photo access.
- Pagination/virtualization for large datasets.
- Full-text search with PostgreSQL GIN indexes.
- Optimistic UI updates.
- Rate limiting on auth endpoints.
- Complete tags system (CRUD + entry association).