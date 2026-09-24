import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Plus, Calendar as CalendarIcon, Smile, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

export default async function JournalPage() {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
          <p className="text-muted-foreground">Your memories and daily activities.</p>
        </div>
        <Link href="/journal/new" className={buttonVariants()}>
          <Plus className="mr-2 h-4 w-4" /> New Entry
        </Link>
      </div>

      <div className="grid gap-4">
        {entries && entries.length > 0 ? (
          entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden transition-all hover:shadow-md">
              <CardContent className="p-0">
                <Link href={`/journal/${entry.id}`} className="block p-6">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="w-4 h-4" />
                        <time>{format(new Date(entry.entry_date), 'MMMM do, yyyy')}</time>
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight">{entry.title}</h3>
                      {entry.description && (
                        <p className="text-muted-foreground line-clamp-2">
                          {entry.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {entry.mood && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Smile className="w-3 h-3" /> {entry.mood}
                          </Badge>
                        )}
                        {/* Tags placeholder - need join table mapping */}
                      </div>
                    </div>
                    
                    {entry.photos?.[0]?.count > 0 && (
                      <div className="flex items-center justify-center bg-muted rounded-md h-24 w-32 shrink-0 text-muted-foreground">
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span className="text-xs font-medium">{entry.photos[0].count} photos</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
            <h3 className="mt-4 text-lg font-semibold">No memories yet</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
              You haven&apos;t written any journal entries.
            </p>
            <Link href="/journal/new" className={buttonVariants()}>Create your first memory</Link>
          </div>
        )}
      </div>
    </div>
  )
}

