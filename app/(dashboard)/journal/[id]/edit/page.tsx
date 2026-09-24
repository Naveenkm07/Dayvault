import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { JournalForm } from '@/components/journal/journal-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function EditJournalEntryPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: entry } = await supabase
    .from('daily_entries')
    .select(`
      *,
      photos (photo_url)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!entry) {
    notFound()
  }

  const initialData = {
    ...entry,
    photos: entry.photos?.map((p) => p.photo_url) || []
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/journal/${entry.id}`} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Memory</h1>
          <p className="text-muted-foreground">Update your journal entry.</p>
        </div>
      </div>

      <JournalForm initialData={initialData} />
    </div>
  )
}
