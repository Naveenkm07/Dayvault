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
        async getSession() {
          const { getToken } = await import('@clerk/nextjs')
          const token = await getToken({ template: 'supabase' })
          if (!token) return null
          
          return {
            access_token: token,
            refresh_token: '',
            expires_in: 0,
            token_type: 'bearer',
            user: null,
          }
        },
      }
    )
  }

  return supabaseClient
}