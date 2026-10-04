import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

const PAGE_SIZE = 1000

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const offset = (page - 1) * PAGE_SIZE

  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const supabase = await createClient()

  // Get profile using Clerk user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .single()

  // Get the internal profile ID for querying related tables
  const profileId = profile?.id

  if (!profileId) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Fetch all user data with pagination
  const { data: entries, count: entriesCount } = await supabase
    .from('daily_entries')
    .select('*', { count: 'exact' })
    .eq('user_id', profileId)
    .order('entry_date', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const { data: plans, count: plansCount } = await supabase
    .from('plans')
    .select('*', { count: 'exact' })
    .eq('user_id', profileId)
    .order('plan_date', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', profileId)

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