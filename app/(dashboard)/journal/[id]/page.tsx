import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Edit, Calendar, MapPin, Smile } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Image from 'next/image'

export default async function JournalEntryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: entry } = await supabase
    .from('daily_entries')
    .select(`
      *,
      photos (*)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!entry) {
    notFound()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center justify-between gap-4">
        <Link href="/journal" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back</span>
        </Link>
        <Link href={`/journal/${entry.id}/edit`} className={buttonVariants({ variant: "outline" })}>
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Link>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{entry.title}</h1>
        
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {format(new Date(entry.entry_date), 'EEEE, MMMM do, yyyy')}
          </div>
          {entry.mood && (
            <div className="flex items-center gap-1">
              <Smile className="w-4 h-4" />
              {entry.mood}
            </div>
          )}
          {entry.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {entry.location}
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap leading-relaxed">{entry.description}</p>
      </div>

      {entry.photos && entry.photos.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Photos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {entry.photos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={photo.photo_url}
                  alt={photo.caption || 'Journal photo'}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
