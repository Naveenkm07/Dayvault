import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Search daily entries
  const { data: entries } = await supabase
    .from('daily_entries')
    .select('id, title, description, entry_date')
    .eq('user_id', user.id)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10)

  // Search plans
  const { data: plans } = await supabase
    .from('plans')
    .select('id, title, description, plan_date')
    .eq('user_id', user.id)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(10)

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

  return NextResponse.json({ results: combined })
}
