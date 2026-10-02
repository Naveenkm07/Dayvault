'use server'

import { createClient } from '@/lib/supabase/server'

export async function createSignedPhotoUrl(storagePath: string): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify the user owns this photo path
  if (!storagePath.startsWith(`${user.id}/`)) {
    return { error: 'Unauthorized' }
  }

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify all paths belong to the user
  for (const path of storagePaths) {
    if (!path.startsWith(`${user.id}/`)) {
      return { error: 'Unauthorized' }
    }
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