'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { togglePlanCompletion } from '@/app/actions/plan'
import { toast } from 'sonner'

export function PlanCheckbox({ id, completed }: { id: string, completed: boolean }) {
  
  async function handleToggle(checked: boolean) {
    const result = await togglePlanCompletion(id, checked)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(checked ? 'Plan completed!' : 'Plan uncompleted')
    }
  }

  return (
    <Checkbox 
      checked={completed} 
      onCheckedChange={(checked) => handleToggle(checked as boolean)}
      className="w-5 h-5 rounded-full"
    />
  )
}
