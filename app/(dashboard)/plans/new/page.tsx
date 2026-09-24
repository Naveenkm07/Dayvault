import { PlanForm } from '@/components/plans/plan-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function NewPlanPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/plans" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="w-5 h-5" />
          <span className="sr-only">Back</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Plan</h1>
          <p className="text-muted-foreground">Schedule a future activity.</p>
        </div>
      </div>

      <PlanForm />
    </div>
  )
}
