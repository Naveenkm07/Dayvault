'use client'

import { useState } from 'react'
import { format, isSameDay } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Notebook, CheckSquare } from 'lucide-react'

type Entry = { id: string, title: string, entry_date: string }
type Plan = { id: string, title: string, plan_date: string, completed: boolean }

export function CalendarClient({ entries, plans }: { entries: Entry[], plans: Plan[] }) {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const selectedEntries = date 
    ? entries.filter(e => isSameDay(new Date(e.entry_date), date))
    : []

  const selectedPlans = date
    ? plans.filter(p => isSameDay(new Date(p.plan_date), date))
    : []

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px]">
      <Card className="flex flex-col items-center justify-center p-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md w-full flex justify-center scale-110 sm:scale-125 md:scale-150 transform origin-top my-4 md:my-12"
          modifiers={{
            hasEntry: entries.map(e => new Date(e.entry_date)),
            hasPlan: plans.map(p => new Date(p.plan_date)),
          }}
          modifiersStyles={{
            hasEntry: { fontWeight: 'bold', textDecoration: 'underline' },
            hasPlan: { color: 'var(--primary)' }
          }}
        />
        <div className="flex gap-4 mt-16 text-sm text-muted-foreground w-full justify-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-foreground"></span>
            <span>Journal Entry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span>Plan</span>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{date ? format(date, 'MMMM d, yyyy') : 'Select a date'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Notebook className="w-4 h-4 text-muted-foreground" />
                Journal Entries
              </h3>
              {selectedEntries.length > 0 ? (
                <ul className="space-y-2">
                  {selectedEntries.map(entry => (
                    <li key={entry.id}>
                      <Link href={`/journal/${entry.id}`} className="text-sm hover:underline block p-2 rounded-md hover:bg-muted">
                        {entry.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No entries for this date.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-muted-foreground" />
                Plans
              </h3>
              {selectedPlans.length > 0 ? (
                <ul className="space-y-2">
                  {selectedPlans.map(plan => (
                    <li key={plan.id} className="text-sm flex items-start gap-2 p-2 rounded-md hover:bg-muted">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${plan.completed ? 'bg-primary' : 'bg-muted-foreground'}`} />
                      <span className={plan.completed ? 'line-through text-muted-foreground' : ''}>
                        {plan.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">No plans for this date.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
