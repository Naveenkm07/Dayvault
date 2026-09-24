import * as z from 'zod'

export const planSchema = z.object({
  id: z.string().optional(),
  plan_date: z.string().min(1, "Date is required"),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High']),
  category: z.string().optional(),
  completed: z.boolean(),
})

export type PlanFormValues = z.infer<typeof planSchema>
