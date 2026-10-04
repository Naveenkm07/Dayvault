'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'

export async function updateProfile({ name, theme, accent_color }: { name: string, theme: string, accent_color: string }) {
  const { userId } = await auth()
  
  if (!userId) {
    return { error: 'Not authenticated' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .upsert({
      clerk_user_id: userId,
      name,
      theme,
      accent_color,
      updated_at: new Date().toISOString()
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  return { success: true }
}