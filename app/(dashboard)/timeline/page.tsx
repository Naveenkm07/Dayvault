import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ImageIcon } from 'lucide-react'

export default async function TimelinePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: entries } = await supabase
    .from('daily_entries')
    .select(`
      *,
      photos (count)
    `)
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  // Group entries by year and month
  type Entry = NonNullable<typeof entries>[0]
  const groupedEntries = entries?.reduce((acc, entry) => {
    const date = new Date(entry.entry_date)
    const year = format(date, 'yyyy')
    const month = format(date, 'MMMM')

    if (!acc[year]) acc[year] = {}
    if (!acc[year][month]) acc[year][month] = []
    
    acc[year][month].push(entry)
    return acc
  }, {} as Record<string, Record<string, Entry[]>>)

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Timeline</h1>
        <p className="text-muted-foreground">A chronological view of your memories.</p>
      </div>

      <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
        {groupedEntries && Object.keys(groupedEntries).sort((a, b) => Number(b) - Number(a)).map(year => (
          <div key={year} className="relative">
            <div className="sticky top-20 z-10 mb-8 flex items-center justify-center">
              <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold shadow-sm">
                {year}
              </span>
            </div>
            
            <div className="space-y-12">
              {Object.keys(groupedEntries[year]).map(month => (
                <div key={month} className="relative">
                  <div className="mb-6 flex items-center md:justify-center">
                    <span className="bg-background text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ml-10 md:ml-0 z-10">
                      {month}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {groupedEntries[year][month].map((entry) => {
                      return (
                        <div key={entry.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:left-1/2 -translate-x-1/2 z-10">
                            <span className="text-xs font-bold">{format(new Date(entry.entry_date), 'dd')}</span>
                          </div>
                          
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] pl-12 md:pl-0">
                            <Link href={`/journal/${entry.id}`}>
                              <Card className="transition-all hover:shadow-md hover:border-primary/50">
                                <CardContent className="p-4">
                                  <h3 className="font-semibold text-lg mb-1">{entry.title}</h3>
                                  {entry.photos?.[0]?.count > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                                      <ImageIcon className="w-3 h-3" />
                                      {entry.photos[0].count} photos
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!entries || entries.length === 0) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No entries found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
