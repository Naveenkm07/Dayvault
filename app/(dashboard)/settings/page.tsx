import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/settings/settings-client'
import { auth } from '@clerk/nextjs/server'

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) return null

  const supabase = await createClient()

  // Fetch profile using Clerk user ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <SettingsClient 
        profile={{ 
          name: profile?.name ?? null, 
          accent_color: profile?.accent_color ?? 'blue' 
        }} 
      />
    </div>
  )
}