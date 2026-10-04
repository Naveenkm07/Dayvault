import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Allowlist of valid redirect paths to prevent open redirect attacks
const ALLOWED_REDIRECTS = new Set([
  '/dashboard',
  '/journal',
  '/calendar',
  '/plans',
  '/timeline',
  '/search',
  '/settings',
  '/',
])

function isValidRedirect(path: string): boolean {
  // Only allow relative paths that start with / and are in allowlist
  if (!path.startsWith('/')) return false
  // Check exact match or prefix match for nested routes
  return ALLOWED_REDIRECTS.has(path) || 
    Array.from(ALLOWED_REDIRECTS).some(allowed => path.startsWith(allowed + '/'))
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  // Validate next parameter to prevent open redirect
  const safeNext = isValidRedirect(next) ? next : '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
