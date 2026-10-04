'use server'

import { createClient } from '@/lib/supabase/server'
import { planSchema, PlanFormValues } from '@/lib/validators/plan'
import { revalidatePath } from 'next/cache'
import { auth } from '@clerk/nextjs/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

async function getProfileId(supabase: SupabaseClient<Database>): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single()
  
  return profile?.id ?? null
}

export async function createPlan(data: PlanFormValues) {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const result = planSchema.safeParse(data)
  if (!result.success) {
    return { error: 'Invalid data' }
  }

  const { error } = await supabase
    .from('plans')
    .insert({
      user_id: profileId,
      title: result.data.title,
      description: result.data.description,
      plan_date: result.data.plan_date,
      priority: result.data.priority,
      category: result.data.category,
      completed: result.data.completed,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/plans')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  return { success: true }
}

export async function updatePlan(data: PlanFormValues) {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const result = planSchema.safeParse(data)
  if (!result.success || !result.data.id) {
    return { error: 'Invalid data' }
  }

  const { error } = await supabase
    .from('plans')
    .update({
      title: result.data.title,
      description: result.data.description,
      plan_date: result.data.plan_date,
      priority: result.data.priority,
      category: result.data.category,
      completed: result.data.completed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', result.data.id)
    .eq('user_id', profileId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/plans')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  return { success: true }
}

export async function togglePlanCompletion(id: string, completed: boolean) {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('plans')
    .update({
      completed,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/plans')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  return { success: true }
}

export async function deletePlan(id: string) {
  const supabase = await createClient()
  const profileId = await getProfileId(supabase)
  if (!profileId) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', id)
    .eq('user_id', profileId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/plans')
  revalidatePath('/dashboard')
  revalidatePath('/calendar')
  return { success: true }
}