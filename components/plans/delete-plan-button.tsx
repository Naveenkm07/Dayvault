'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deletePlan } from '@/app/actions/plan'
import { toast } from 'sonner'
import { useState } from 'react'

export function DeletePlanButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (confirm('Are you sure you want to delete this plan?')) {
      setIsDeleting(true)
      const result = await deletePlan(id)
      if (result.error) {
        toast.error(result.error)
        setIsDeleting(false)
      } else {
        toast.success('Plan deleted')
      }
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-6 w-6 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <Trash2 className="h-4 w-4" />
      <span className="sr-only">Delete</span>
    </Button>
  )
}
