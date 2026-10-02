import * as z from 'zod'

export const tagSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().optional(),
})

export type TagFormValues = z.infer<typeof tagSchema>