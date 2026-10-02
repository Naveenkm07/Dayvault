'use server'

import { createClient } from '@/lib/supabase/server'
import { tagSchema, TagFormValues } from '@/lib/validators/tag'
import { revalidatePath } from 'next/cache'

export async function createTag(data: TagFormValues) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const result = tagSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Invalid data' }
  }

  const { data: newTag, error } = await supabase
    .from('tags')
    .insert({
      user_id: user.id,
      name: result.data.name,
      color: result.data.color,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/journal')
  revalidatePath('/settings')
  return { success: true, tag: newTag }
}

export async function updateTag(data: TagFormValues) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const result = tagSchema.safeParse(data)
  if (!result.success || !result.data.id) {
    return { error: 'Invalid data' }
  }

  const { error } = await supabase
    .from('tags')
    .update({
      name: result.data.name,
      color: result.data.color,
    })
    .eq('id', result.data.id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/journal')
  revalidatePath('/settings')
  return { success: true }
}

export async function deleteTag(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // First delete associated entry_tags
  await supabase.from('entry_tags').delete().eq('tag_id', id)

  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/journal')
  revalidatePath('/settings')
  return { success: true }
}

export async function getUserTags() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: tags, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  if (error) {
    return { error: error.message }
  }

  return { tags: tags || [] }
}

export async function addTagToEntry(entryId: string, tagId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify entry belongs to user
  const { data: entry } = await supabase
    .from('daily_entries')
    .select('id')
    .eq('id', entryId)
    .eq('user_id', user.id)
    .single()

  if (!entry) {
    return { error: 'Entry not found' }
  }

  // Verify tag belongs to user
  const { data: tag } = await supabase
    .from('tags')
    .select('id')
    .eq('id', tagId)
    .eq('user_id', user.id)
    .single()

  if (!tag) {
    return { error: 'Tag not found' }
  }

  const { error } = await supabase
    .from('entry_tags')
    .insert({ entry_id: entryId, tag_id: tagId })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/journal')
  revalidatePath(`/journal/${entryId}`)
  return { success: true }
}

export async function removeTagFromEntry(entryId: string, tagId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('entry_tags')
    .delete()
    .eq('entry_id', entryId)
    .eq('tag_id', tagId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/journal')
  revalidatePath(`/journal/${entryId}`)
  return { success: true }
}

export async function getEntryTags(entryId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: entryTags, error } = await supabase
    .from('entry_tags')
    .select(`
      tag_id,
      tags (*)
    `)
    .eq('entry_id', entryId)

  if (error) {
    return { error: error.message }
  }

  const tags = entryTags?.map(et => et.tags).filter(Boolean) || []
  return { tags }
}