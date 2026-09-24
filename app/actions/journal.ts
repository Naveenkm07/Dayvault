'use server'

import { createClient } from '@/lib/supabase/server'
import { journalEntrySchema, JournalEntryFormValues } from '@/lib/validators/journal'
import { revalidatePath } from 'next/cache'

export async function createJournalEntry(data: JournalEntryFormValues) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const result = journalEntrySchema.safeParse(data)
  if (!result.success) {
    return { error: 'Invalid data' }
  }

  const { data: newEntry, error } = await supabase
    .from('daily_entries')
    .insert({
      user_id: user.id,
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
      entry_id: newEntry.id,
      photo_url: photoUrl
    }))
    
    await supabase.from('photos').insert(photoInserts)
  }

  revalidatePath('/journal')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/timeline')
  return { success: true }
}

export async function updateJournalEntry(data: JournalEntryFormValues) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const result = journalEntrySchema.safeParse(data)
  if (!result.success || !result.data.id) {
    return { error: 'Invalid data' }
  }

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
    .eq('id', result.data.id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  // Very simple approach: delete old photos and insert new ones
  if (result.data.photos !== undefined) {
    await supabase.from('photos').delete().eq('entry_id', result.data.id)
    
    if (result.data.photos.length > 0) {
      const photoInserts = result.data.photos.map(photoUrl => ({
        entry_id: result.data.id,
        photo_url: photoUrl
      }))
      await supabase.from('photos').insert(photoInserts)
    }
  }

  revalidatePath('/journal')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/timeline')
  return { success: true }
}

export async function deleteJournalEntry(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('daily_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/journal')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  revalidatePath('/timeline')
  return { success: true }
}
