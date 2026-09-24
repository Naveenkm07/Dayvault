import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Notebook, CheckSquare, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch some basic stats
  const [
    { count: entriesCount },
    { count: photosCount },
    { count: plansCount },
    { count: completedPlansCount },
  ] = await Promise.all([
    supabase.from('daily_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('photos').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('plans').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('plans').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
  ])

  const today = format(new Date(), 'yyyy-MM-dd')
  
  // Fetch today's plans
  const { data: todaysPlans } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('plan_date', today)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent entries
  const { data: recentEntries } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Good morning 👋</h1>
        <p className="text-muted-foreground">
          Welcome back. Today is {format(new Date(), 'EEEE, MMMM do, yyyy')}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Notebook className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entriesCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{photosCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plansCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Plans</CardTitle>
            <CheckSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPlansCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <Link href="/journal/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Add Today&apos;s Activity
        </Link>
        <Link href="/plans" className={buttonVariants({ variant: "secondary" })}>
          <CheckSquare className="mr-2 h-4 w-4" /> Add Plan
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Plans</CardTitle>
            <CardDescription>What you have scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysPlans && todaysPlans.length > 0 ? (
              <ul className="space-y-3">
                {todaysPlans.map((plan) => (
                  <li key={plan.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${plan.completed ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    <span className={plan.completed ? 'line-through text-muted-foreground' : ''}>
                      {plan.title}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                No plans for today.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Memories</CardTitle>
            <CardDescription>Your latest journal entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEntries && recentEntries.length > 0 ? (
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="border-b last:border-0 pb-4 last:pb-0">
                    <h4 className="font-semibold">{entry.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-6">
                No memories yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
