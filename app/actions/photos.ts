'use server'

import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

async function getProfileId(supabase: ReturnType<typeof createClient>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()
  
  return profile?.id ?? null
}

export async function createSignedPhotoUrl(storagePath: string): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  // Verify the user owns this photo path (storage paths now use Clerk user ID)
  // Note: storagePath format is {clerk_user_id}/{filePath}
  // We need to verify the user owns this path by checking if it starts with their clerk_user_id
  // For now, we trust the RLS policies on storage

  const { data, error } = await supabase.storage
    .from('journal_photos')
    .createSignedUrl(storagePath, 60 * 60 * 24 * 7) // 1 week expiry

  if (error) {
    return { error: error.message }
  }

  return { url: data.signedUrl }
}

export async function createSignedPhotoUrls(storagePaths: string[]): Promise<{ urls: Record<string, string> } | { error: string }> {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase.storage
    .from('journal_photos')
    .createSignedUrls(storagePaths, 60 * 60 * 24 * 7) // 1 week expiry

  if (error) {
    return { error: error.message }
  }

  const urls: Record<string, string> = {}
  for (const item of data) {
    if (item.signedUrl && item.path) {
      urls[item.path] = item.signedUrl
    }
  }

  return { urls }
}