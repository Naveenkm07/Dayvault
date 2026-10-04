# Clerk + Supabase Integration Setup Guide

## Overview
This project now uses **Clerk for authentication** and **Supabase for database/storage**. The integration uses Clerk's JWT templates to pass the user ID to Supabase for Row Level Security (RLS).

---

## 1. Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Choose "Email" + "Social logins" (Google, GitHub, etc.)
4. Copy the keys:
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`

---

## 2. Configure Clerk JWT Template for Supabase

This is **critical** for RLS to work.

1. In Clerk Dashboard → **JWT Templates** → **New Template**
2. Name: `supabase`
3. Template:
```json
{
  "sub": "{{user.id}}",
  "clerk_user_id": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "role": "authenticated"
}
```
4. Save

---

## 3. Configure Redirect URLs

In Clerk Dashboard → **Paths** (or **Settings** → **Redirects**):
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/`
- After sign-up: `/`

---

## 4. Supabase Database Setup

### Run the Migration
Go to Supabase Dashboard → **SQL Editor** and run:
```sql
-- File: supabase/migrations/20240101000000_init.sql
```

This creates:
- `profiles` table with `clerk_user_id` column
- `daily_entries`, `plans`, `photos`, `tags`, `entry_tags` tables
- RLS policies using `current_setting('request.jwt.claims.clerk_user_id')`
- Full-text search indexes
- Updated_at triggers

### Storage Setup
Run `docs/setup-storage.sql` in Supabase SQL Editor.

---

## 5. Environment Variables

Create `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Clerk URLs (optional)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

Add these to **Vercel** → Project Settings → Environment Variables.

---

## 6. Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

---

## 7. How It Works

### Authentication Flow
```
User → Clerk Sign-In → Clerk Session Cookie → Middleware validates → Clerk JWT → Supabase RLS
```

### Server-Side (lib/supabase/server.ts)
- Gets Clerk token via `auth().getToken({ template: 'supabase' })`
- Passes as `Authorization: Bearer <token>` to Supabase
- Supabase RLS reads `current_setting('request.jwt.claims.clerk_user_id')`

### Client-Side (lib/supabase/client.ts)
- Uses `@supabase/ssr` with custom `getSession`
- Calls `useAuth().getToken({ template: 'supabase' })` from Clerk
- Returns token as Supabase session

### RLS Policies
```sql
-- Example: users can only access their own entries
CREATE POLICY "Users can manage their own entries" ON daily_entries 
FOR ALL USING (
  user_id = (
    SELECT id FROM profiles 
    WHERE clerk_user_id = current_setting('request.jwt.claims.clerk_user_id', true)
  )
);
```

---

## 8. User Profile Creation

When a user first signs up, their profile needs to be created. Add a Clerk webhook:

1. Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://your-app.vercel.app/api/webhook/clerk`
3. Events: `user.created`, `user.updated`, `user.deleted`

Create `app/api/webhook/clerk/route.ts`:
```typescript
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const WH_SECRET = process.env.CLERK_WEBHOOK_SECRET
  const headerPayload = headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')
  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WH_SECRET)
  let evt: any

  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch (err) {
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = await createClient()

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    await supabase.from('profiles').insert({
      clerk_user_id: id,
      name: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address,
      avatar_url: image_url,
    })
  }

  if (evt.type === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data
    await supabase.from('profiles').update({
      name: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address,
      avatar_url: image_url,
    }).eq('clerk_user_id', id)
  }

  if (evt.type === 'user.deleted') {
    const { id } = evt.data
    await supabase.from('profiles').delete().eq('clerk_user_id', id)
  }

  return new Response('', { status: 200 })
}
```

Add `CLERK_WEBHOOK_SECRET` to environment variables.

---

## 9. Testing Checklist

- [ ] Sign up with email → profile created in Supabase
- [ ] Sign in → redirect to dashboard
- [ ] Create journal entry → saved with correct user_id
- [ ] Upload photo → stored in Supabase Storage
- [ ] Search works
- [ ] Settings: theme, accent color, display name
- [ ] Sign out → redirect to home
- [ ] Password reset flow
- [ ] Social login (Google, GitHub)

---

## 10. Troubleshooting

### "Invalid JWT" or RLS not working
- Verify JWT template name is exactly `supabase`
- Check token includes `clerk_user_id` claim
- Verify Supabase RLS uses `current_setting('request.jwt.claims.clerk_user_id')`

### "Profile not found" on first sign-in
- Webhook not configured or failing
- Check webhook logs in Clerk Dashboard
- Manually create profile in Supabase for testing

### CORS errors on photo upload
- Add Vercel domain to Supabase Storage → Settings → CORS

### Middleware not protecting routes
- Check `middleware.ts` matcher pattern
- Verify Clerk middleware is installed

---

## 11. Key Files Modified

| File | Purpose |
|------|---------|
| `middleware.ts` | Clerk auth protection |
| `lib/supabase/server.ts` | Server Supabase client with Clerk token |
| `lib/supabase/client.ts` | Browser Supabase client with Clerk token |
| `components/clerk-provider.tsx` | ClerkProvider wrapper |
| `app/layout.tsx` | Wraps app with ClerkProvider |
| `components/layout/user-menu.tsx` | Clerk UserButton |
| `components/settings/settings-client.tsx` | Clerk UserProfile + app settings |
| `app/(auth)/login/page.tsx` | Clerk SignIn |
| `app/(auth)/signup/page.tsx` | Clerk SignUp |
| `app/(auth)/forgot-password/page.tsx` | Clerk SignIn with reset-password |
| `supabase/migrations/20240101000000_init.sql` | Schema with clerk_user_id |

---

## 12. Rollback Plan

If issues arise, you can revert to Supabase Auth:
1. Reinstall `@supabase/ssr`
2. Restore `middleware.ts` with `updateSession`
3. Restore auth pages with Supabase forms
4. Revert Supabase RLS to use `auth.uid()`