import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Fetch all user data
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: entries } = await supabase.from('daily_entries').select('*').eq('user_id', user.id)
  const { data: plans } = await supabase.from('plans').select('*').eq('user_id', user.id)
  const { data: tags } = await supabase.from('tags').select('*').eq('user_id', user.id)
  const { data: entryTags } = await supabase.from('entry_tags').select('*').eq('user_id', user.id)

  const exportData = {
    export_date: new Date().toISOString(),
    profile,
    entries: entries || [],
    plans: plans || [],
    tags: tags || [],
    entry_tags: entryTags || []
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="dayvault-export-${new Date().toISOString().split('T')[0]}.json"`,
    },
  })
}
