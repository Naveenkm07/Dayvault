import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

const PAGE_SIZE = 20

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  if (!query) {
    return NextResponse.json({ results: [], page, totalPages: 0 })
  }

  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get profile using Clerk user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile) {
    return NextResponse.json({ results: [], page, totalPages: 0 })
  }

  const profileId = profile.id

  // Search daily entries
  const { data: entries, count: entriesCount } = await supabase
    .from('daily_entries')
    .select('id, title, description, entry_date', { count: 'exact' })
    .eq('user_id', profileId)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .range(offset, offset + PAGE_SIZE - 1)

  // Search plans
  const { data: plans, count: plansCount } = await supabase
    .from('plans')
    .select('id, title, description, plan_date', { count: 'exact' })
    .eq('user_id', profileId)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .range(offset, offset + PAGE_SIZE - 1)

  const formattedEntries = (entries || []).map((e) => ({
    ...e,
    type: 'journal',
  }))

  const formattedPlans = (plans || []).map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    entry_date: p.plan_date,
    type: 'plan',
  }))

  const combined = [...formattedEntries, ...formattedPlans].sort((a, b) => {
    return new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  })

  const totalCount = (entriesCount || 0) + (plansCount || 0)
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return NextResponse.json({ results: combined, page, totalPages })
}