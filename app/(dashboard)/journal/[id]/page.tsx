import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Edit, Calendar, MapPin, Smile, Tag } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'

export default async function JournalEntryPage({ params }: { params: { id: string } }) {
  const { userId } = await auth()

  if (!userId) return null

  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', userId)
    .single()

  if (!profile) return null

  const profileId = profile.id

  const { data: entry } = await supabase
    .from('daily_entries')
    .select(`
      *,
      photos (*),
      entry_tags (
        tag_id,
        tags (*)
      )
    `)
    .eq('id', params.id)
    .eq('user_id', profileId)
    .single()

  if (!entry) {
    notFound()
  }

  // Generate signed URLs for photos
  const photosWithSignedUrls = await Promise.all(
    (entry.photos || []).map(async (photo) => {
      const { data } = await supabase.storage
        .from('journal_photos')
        .createSignedUrl(photo.storage_path, 60 * 60 * 24 * 7) // 1 week
      return { ...photo, signed_url: data?.signedUrl }
    })
  )

  // Extract tags from entry_tags
  const tags = (entry.entry_tags?.map((et: { tags: { id: string; name: string; color: string | null } | null }) => et.tags).filter((tag): tag is { id: string; name: string; color: string | null } => Boolean(tag)) || []) as { id: string; name: string; color: string | null }[]

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
          {tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <Tag className="w-4 h-4" />
              {tags.map((tag: { id: string; name: string; color: string | null }) => (
                <span key={tag.id} className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground" style={{ borderColor: tag.color || 'transparent' }}>
                  {tag.color && <span className="w-2 h-2 rounded-full mr-1 inline-block" style={{ backgroundColor: tag.color }} />}
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p className="whitespace-pre-wrap leading-relaxed">{entry.description}</p>
      </div>

      {photosWithSignedUrls.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">Photos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {photosWithSignedUrls.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                {photo.signed_url ? (
                  <Image
                    src={photo.signed_url}
                    alt={photo.caption || 'Journal photo'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                    Failed to load image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}