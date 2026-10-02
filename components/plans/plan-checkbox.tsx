'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { togglePlanCompletion } from '@/app/actions/plan'
import { toast } from 'sonner'

export function PlanCheckbox({ id, completed: initialCompleted }: { id: string, completed: boolean }) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [isToggling, setIsToggling] = useState(false)

  async function handleToggle(checked: boolean) {
    // Optimistic update
    const previousCompleted = completed
    setCompleted(checked)
    setIsToggling(true)

    try {
      const result = await togglePlanCompletion(id, checked)
      if (result.error) {
        // Revert on error
        setCompleted(previousCompleted)
        toast.error(result.error)
      } else {
        toast.success(checked ? 'Plan completed!' : 'Plan uncompleted')
      }
    } catch {
      setCompleted(previousCompleted)
      toast.error('Something went wrong')
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <Checkbox 
      checked={completed} 
      onCheckedChange={(checked) => handleToggle(checked as boolean)}
      className="w-5 h-5 rounded-full"
      disabled={isToggling}
    />
  )
}
