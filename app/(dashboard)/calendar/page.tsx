import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from '@/components/calendar/calendar-client'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all entries and plans to pass to the calendar
  // In a real production app with thousands of records, 
  // you would fetch this dynamically via API as the month changes.
  // For standard usage, fetching all lightweight records is acceptable.
  const [{ data: entries }, { data: plans }] = await Promise.all([
    supabase.from('daily_entries').select('id, title, entry_date').eq('user_id', user.id),
    supabase.from('plans').select('id, title, plan_date, completed').eq('user_id', user.id)
  ])

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">View your memories and plans by date.</p>
      </div>
      <CalendarClient entries={entries || []} plans={plans || []} />
    </div>
  )
}
