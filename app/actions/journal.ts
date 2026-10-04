'use server'

import { createClient } from '@/lib/supabase/server'
import { journalEntrySchema, JournalEntryFormValues } from '@/lib/validators/journal'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { auth } from '@clerk/nextjs/server'

type SupabaseServerClient = SupabaseClient<Database>

function extractStoragePath(photoUrl: string, _userId: string): string {
  const url = new URL(photoUrl)
  const pathParts = url.pathname.split('/')
  const bucketIndex = pathParts.findIndex(p => p === 'journal_photos')
  if (bucketIndex !== -1 && bucketIndex + 1 < pathParts.length) {
    return pathParts.slice(bucketIndex + 1).join('/')
  }
  return photoUrl.split('journal_photos/')[1] || ''
}

async function handleTags(
  supabase: SupabaseServerClient,
  entryId: string,
  profileId: string,
  tagIds: string[] | undefined
) {
  if (tagIds === undefined) return

  const { data: currentTags } = await supabase
    .from('entry_tags')
    .select('tag_id')
    .eq('entry_id', entryId)

  const currentTagIds = currentTags?.map((t: { tag_id: string }) => t.tag_id) || []
  const newTagIds = tagIds || []

  const tagsToRemove = currentTagIds.filter((id: string) => !newTagIds.includes(id))
  if (tagsToRemove.length > 0) {
    await supabase
      .from('entry_tags')
      .delete()
      .eq('entry_id', entryId)
      .in('tag_id', tagsToRemove)
  }

  const tagsToAdd = newTagIds.filter(id => !currentTagIds.includes(id))
  if (tagsToAdd.length > 0) {
    const tagInserts = tagsToAdd.map(tagId => ({ entry_id: entryId, tag_id: tagId }))
    await supabase.from('entry_tags').insert(tagInserts)
  }
}

async function getProfileId(supabase: SupabaseServerClient): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()
  
  return profile?.id ?? null
}

export async function createJournalEntry(data: JournalEntryFormValues) {
  const supabase = await createClient()

  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const result = journalEntrySchema.safeParse(data)
  if (!result.success) {
    return { error: 'Invalid data' }
  }

  const { data: newEntry, error } = await supabase
    .from('daily_entries')
    .insert({
      user_id: profileId,
      title: result.data.title,
      description: result.data.description,
      entry_date: result.data.entry_date,
      mood: result.data.mood,
      location: result.data.location,
    })
    .select('id')
    .single()

  if (error) {
    return { error: error.message }
  }

  if (result.data.photos && result.data.photos.length > 0) {
    const photoInserts = result.data.photos.map(photoUrl => ({
      user_id: profileId,
      entry_id: newEntry.id,
      photo_url: photoUrl,
      storage_path: extractStoragePath(photoUrl, profileId)
    }))
    
    await supabase.from('photos').insert(photoInserts)
  }

  await handleTags(supabase, newEntry.id, profileId, result.data.tags)

  revalidatePath('/journal')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/timeline')
  return { success: true }
}

export async function updateJournalEntry(data: JournalEntryFormValues) {
  const supabase = await createClient()

  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const result = journalEntrySchema.safeParse(data)
  if (!result.success || !result.data.id) {
    return { error: 'Invalid data' }
  }

  const entryId = result.data.id

  const { error } = await supabase
    .from('daily_entries')
    .update({
      title: result.data.title,
      description: result.data.description,
      entry_date: result.data.entry_date,
      mood: result.data.mood,
      location: result.data.location,
      updated_at: new Date().toISOString(),
    })
    .eq('id', entryId)
    .eq('user_id', profileId)

  if (error) {
    return { error: error.message }
  }

  if (result.data.photos !== undefined) {
    const { data: oldPhotos } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('entry_id', entryId)
    
    if (oldPhotos && oldPhotos.length > 0) {
      await supabase.storage.from('journal_photos').remove(
        oldPhotos.map(p => p.storage_path)
      )
    }
    
    await supabase.from('photos').delete().eq('entry_id', entryId)
    
    if (result.data.photos.length > 0) {
      const photoInserts = result.data.photos.map(photoUrl => ({
        user_id: profileId,
        entry_id: entryId,
        photo_url: photoUrl,
        storage_path: extractStoragePath(photoUrl, profileId)
      }))
      await supabase.from('photos').insert(photoInserts)
    }
  }

  await handleTags(supabase, entryId, profileId, result.data.tags)

  revalidatePath('/journal')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/timeline')
  return { success: true }
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient()

  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const { data: photos } = await supabase
    .from('photos')
    .select('storage_path')
    .eq('entry_id', id)
    .eq('user_id', profileId)

  const { error } = await supabase
    .from('daily_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) {
    return { error: error.message }
  }

  if (photos && photos.length > 0) {
    await supabase.storage.from('journal_photos').remove(
      photos.map(p => p.storage_path)
    )
  }

  revalidatePath('/journal')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/timeline')
  return { success: true }
}