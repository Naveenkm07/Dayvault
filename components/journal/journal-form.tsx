'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

import { journalEntrySchema, JournalEntryFormValues } from '@/lib/validators/journal'
import { createJournalEntry, updateJournalEntry } from '@/app/actions/journal'
import { ImageUpload } from '@/components/journal/image-upload'
import { TagsManager } from '@/components/journal/tags-manager'

const MOODS = [
  { value: 'Excellent', label: '😄 Excellent' },
  { value: 'Good', label: '🙂 Good' },
  { value: 'Neutral', label: '😐 Neutral' },
  { value: 'Low', label: '😔 Low' },
  { value: 'Angry', label: '😡 Angry' },
  { value: 'Tired', label: '😴 Tired' },
  { value: 'Excited', label: '🤩 Excited' },
]

export function JournalForm({ initialData }: { initialData?: Partial<JournalEntryFormValues> & { id?: string } }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date | undefined>(
    initialData?.entry_date ? new Date(initialData.entry_date) : new Date()
  )

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      id: initialData?.id,
      title: initialData?.title || '',
      description: initialData?.description || '',
      mood: initialData?.mood || '',
      location: initialData?.location || '',
      entry_date: initialData?.entry_date || format(new Date(), 'yyyy-MM-dd'),
      photos: initialData?.photos || [],
      tags: initialData?.tags || [],
    },
  })

  async function onSubmit(data: JournalEntryFormValues) {
    setIsSubmitting(true)
    
    // Ensure date is updated in the form data
    if (date) {
      data.entry_date = format(date, 'yyyy-MM-dd')
    }

    try {
      let result;
      if (data.id) {
        result = await updateJournalEntry(data)
      } else {
        result = await createJournalEntry(data)
      }

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(data.id ? 'Entry updated successfully' : 'Entry created successfully')
        router.push('/journal')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="entry_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
                        "w-full pl-3 text-left font-normal",
                        !date && "text-muted-foreground"
                      )}>
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate)
                            if (newDate) {
                              field.onChange(format(newDate, 'yyyy-MM-dd'))
                            }
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How are you feeling?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MOODS.map(mood => (
                          <SelectItem key={mood.value} value={mood.value}>
                            {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. College + Project Work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Journal Entry</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write down what happened today..." 
                      className="min-h-[200px] resize-y" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="photos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photos</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      value={field.value || []} 
                      onChange={field.onChange} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsManager
                      entryId={initialData?.id}
                      selectedTags={field.value || []}
                      onTagsChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData?.id ? 'Update Entry' : 'Save Entry'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
