import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 1000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Fetch all user data with pagination
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: entries, count: entriesCount } = await supabase
    .from('daily_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)
  
  const { data: plans, count: plansCount } = await supabase
    .from('plans')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('plan_date', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)
  
  const { data: tags } = await supabase.from('tags').select('*').eq('user_id', user.id)
  
  // entry_tags is a join table without user_id - fetch via entries
  const entryIds = entries?.map(e => e.id) || []
  const { data: entryTags } = entryIds.length > 0
    ? await supabase.from('entry_tags').select('*').in('entry_id', entryIds)
    : { data: [] }

  const totalEntries = entriesCount || 0
  const totalPlans = plansCount || 0
  const totalPages = Math.max(
    Math.ceil(totalEntries / PAGE_SIZE),
    Math.ceil(totalPlans / PAGE_SIZE),
    1
  )

  const exportData = {
    export_date: new Date().toISOString(),
    page,
    totalPages,
    profile,
    entries: entries || [],
    plans: plans || [],
    tags: tags || [],
    entry_tags: entryTags || []
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="dayvault-export-${new Date().toISOString().split('T')[0]}-page${page}.json"`,
    },
  })
}
