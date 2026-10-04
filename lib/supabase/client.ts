import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient<Database> | null = null

export function createClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            let clerkToken = null
            // Try to get token from global window.Clerk object
            // @ts-ignore
            if (typeof window !== 'undefined' && window.Clerk?.session) {
              // @ts-ignore
              clerkToken = await window.Clerk.session.getToken({ template: 'supabase' })
            }
            
            const headers = new Headers(options?.headers)
            if (clerkToken) {
              headers.set('Authorization', `Bearer ${clerkToken}`)
            }
            
            return fetch(url, {
              ...options,
              headers,
            })
          },
        },
      }
    )
  }

  return supabaseClient
}