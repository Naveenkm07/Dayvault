import * as z from 'zod'

export const journalEntrySchema = z.object({
  id: z.string().optional(),
  entry_date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  mood: z.string().optional(),
  location: z.string().optional(),
  photos: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
})

export type JournalEntryFormValues = z.infer<typeof journalEntrySchema>
