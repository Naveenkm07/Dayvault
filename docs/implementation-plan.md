# DAYVAULT - Implementation Plan

## 1. Architecture
- **Frontend/Backend:** Next.js (App Router) serving as a full-stack framework.
- **Client:** React, Tailwind CSS, shadcn/ui for components.
- **Database/Auth/Storage:** Supabase.
- **Deployment:** Vercel.

## 2. Technology Stack
- Next.js 14+ (App Router)
- React 18+
- TypeScript (Strict Mode)
- Tailwind CSS
- shadcn/ui (Radix UI primitives)
- Lucide React (Icons)
- Supabase (PostgreSQL, Auth, Storage)
- Zod (Validation)
- React Hook Form (Forms)
- date-fns (Date manipulation)
- Zustand (Client-side state management, if needed)

## 3. Folder Structure
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
      /calendar
      /plans
      /timeline
      /search
      /settings
    /api
      /entries
      /plans
      /photos
      /search
    /layout.tsx
    /page.tsx
  /components
    /ui
    /layout
    /dashboard
    /journal
    /calendar
    /plans
    /timeline
    /search
    /settings
  /lib
    /supabase
      client.ts
      server.ts
      middleware.ts
    /validators
    /utils.ts
    /queries
    /services
  /types
  /hooks
  /public
  /docs
  /tests
  /supabase
    /migrations
```

## 4. Database Schema (Supabase PostgreSQL)
- **profiles:** `id` (references auth.users), `name`, `avatar_url`, `theme`, `accent_color`, `created_at`, `updated_at`.
- **daily_entries:** `id`, `user_id`, `entry_date`, `title`, `description`, `mood`, `location`, `created_at`, `updated_at`.
- **photos:** `id`, `user_id`, `entry_id`, `storage_path`, `public_or_signed_url_reference`, `caption`, `created_at`.
- **plans:** `id`, `user_id`, `plan_date`, `title`, `description`, `priority`, `category`, `completed`, `created_at`, `updated_at`.
- **tags:** `id`, `user_id`, `name`, `color`, `created_at`.
- **entry_tags:** `entry_id`, `tag_id`.

## 5. Authentication Flow
- Handled by Supabase Auth (Email/Password).
- `app/auth/callback` route for setting up sessions.
- Middleware (`middleware.ts`) to protect `/(dashboard)` routes and redirect unauthenticated users to `/login`.
- Session management using Supabase SSR packages (`@supabase/ssr`).

## 6. Storage Strategy
- Supabase Storage Bucket: `dayvault-photos`.
- Bucket is Private. RLS policies ensure users can only upload, read, and delete their own photos.
- Photos will be accessed via Signed URLs or downloaded through authenticated API routes.

## 7. Page Structure
- **Landing (/)**: Public overview, call to action.
- **Auth (/(auth)/*)**: Login, Signup, Forgot Password.
- **Dashboard (/(dashboard)/dashboard)**: Quick overview, stats, today's info, recent entries.
- **Journal (/(dashboard)/journal)**: List of entries, Create/Edit entry editor.
- **Calendar (/(dashboard)/calendar)**: Calendar view showing entries and plans.
- **Timeline (/(dashboard)/timeline)**: Chronological vertical timeline of entries.
- **Plans (/(dashboard)/plans)**: Future planning, checklist, tasks.
- **Search (/(dashboard)/search)**: Global search for entries/plans.
- **Settings (/(dashboard)/settings)**: Profile, Theme, Accent Color, Data Export.

## 8. API / Data Access Strategy
- Supabase Server Client will be used within Next.js Server Components and Server Actions.
- Data fetching will happen on the server where possible, passing initial data to client components.
- Mutations will be handled via Next.js Server Actions or Route Handlers (using Zod for validation).

## 9. Security Model
- **Row Level Security (RLS)**: Enforced on all tables. Users only see `user_id = auth.uid()`.
- **Validation**: All inputs validated via Zod on the server.
- **Environment Variables**: No sensitive keys exposed to the browser. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public.

## 10. Testing Strategy
- Unit tests for utility functions (e.g., streak calculations).
- Integration tests for Server Actions/Data access (using a test database if possible, or mocking).
- Basic End-to-End tests (Playwright/Cypress) for critical flows: Signup, Login, Create Entry, Upload Photo.

## 11. Deployment Strategy
- Hosted on Vercel.
- Environment variables configured in Vercel dashboard.
- GitHub integration for CI/CD.

## 12. Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (optional, for admin tasks only)
```

## 13. Future Improvements
- Google OAuth integration.
- Mobile application (React Native).
- Rich text editor for journal entries.
- AI-based summaries of journal entries.
