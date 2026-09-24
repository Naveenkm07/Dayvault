import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Plus, CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { PlanCheckbox } from '@/components/plans/plan-checkbox'
import { DeletePlanButton } from '@/components/plans/delete-plan-button'

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .order('plan_date', { ascending: true })

  // Group by date
  type Plan = NonNullable<typeof plans>[0]
  const groupedPlans = plans?.reduce((acc, plan) => {
    if (!acc[plan.plan_date]) {
      acc[plan.plan_date] = []
    }
    acc[plan.plan_date].push(plan)
    return acc
  }, {} as Record<string, Plan[]>)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Future Plans</h1>
          <p className="text-muted-foreground">What comes next.</p>
        </div>
        <Link href="/plans/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Link>
      </div>

      <div className="space-y-8">
        {groupedPlans && Object.keys(groupedPlans).length > 0 ? (
          Object.entries(groupedPlans).map(([date, dayPlans]) => (
            <div key={date} className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {format(new Date(date), 'EEEE, MMMM do')}
              </h2>
              <div className="grid gap-3">
                {(dayPlans).map((plan) => (
                  <Card key={plan.id} className={plan.completed ? 'opacity-60 bg-muted/50' : ''}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="pt-1">
                        <PlanCheckbox id={plan.id} completed={plan.completed} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-medium ${plan.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {plan.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {plan.priority === 'High' && <Badge variant="destructive">High</Badge>}
                            {plan.priority === 'Medium' && <Badge variant="secondary">Medium</Badge>}
                            {plan.priority === 'Low' && <Badge variant="outline">Low</Badge>}
                            
                            <DeletePlanButton id={plan.id} />
                          </div>
                        </div>
                        {plan.description && (
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        )}
                        {plan.category && (
                          <p className="text-xs font-medium text-muted-foreground pt-1">{plan.category}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <h3 className="mt-4 text-lg font-semibold">No plans yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven&apos;t added any future plans.
            </p>
            <Link href="/plans/new" className={buttonVariants()}>Add a plan</Link>
          </div>
        )}
      </div>
    </div>
  )
}
