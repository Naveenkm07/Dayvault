import { createClient } from '@/lib/supabase/server'
import { CalendarClient } from '@/components/calendar/calendar-client'
import { format, startOfMonth, endOfMonth } from 'date-fns'

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const params = await searchParams
  const monthParam = params.month || format(new Date(), 'yyyy-MM')
  const [year, month] = monthParam.split('-').map(Number)
  const monthStart = startOfMonth(new Date(year, month - 1))
  const monthEnd = endOfMonth(new Date(year, month - 1))

  // Fetch entries and plans for the current month only
  const [{ data: entries }, { data: plans }] = await Promise.all([
    supabase
      .from('daily_entries')
      .select('id, title, entry_date')
      .eq('user_id', user.id)
      .gte('entry_date', format(monthStart, 'yyyy-MM-dd'))
      .lte('entry_date', format(monthEnd, 'yyyy-MM-dd')),
    supabase
      .from('plans')
      .select('id, title, plan_date, completed')
      .eq('user_id', user.id)
      .gte('plan_date', format(monthStart, 'yyyy-MM-dd'))
      .lte('plan_date', format(monthEnd, 'yyyy-MM-dd'))
  ])

  const prevMonth = format(new Date(year, month - 2), 'yyyy-MM')
  const nextMonth = format(new Date(year, month), 'yyyy-MM')

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View your memories and plans by date.</p>
        </div>
        <div className="flex items-center gap-4">
          <a href={`/calendar?month=${prevMonth}`} className="text-sm text-muted-foreground hover:text-foreground">
            ← {format(new Date(year, month - 2), 'MMM yyyy')}
          </a>
          <span className="font-semibold">{format(new Date(year, month - 1), 'MMMM yyyy')}</span>
          <a href={`/calendar?month=${nextMonth}`} className="text-sm text-muted-foreground hover:text-foreground">
            {format(new Date(year, month), 'MMM yyyy')} →
          </a>
        </div>
      </div>
      <CalendarClient entries={entries || []} plans={plans || []} />
    </div>
  )
}
