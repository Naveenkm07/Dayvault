'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@clerk/nextjs'

const ACCENT_COLORS = [
  { id: 'blue', name: 'Blue', primary: 'oklch(0.57 0.24 262.881)', primaryForeground: 'oklch(0.985 0 0)' },
  { id: 'purple', name: 'Purple', primary: 'oklch(0.58 0.24 297.741)', primaryForeground: 'oklch(0.985 0 0)' },
  { id: 'emerald', name: 'Emerald', primary: 'oklch(0.57 0.18 155.8)', primaryForeground: 'oklch(0.985 0 0)' },
  { id: 'rose', name: 'Rose', primary: 'oklch(0.64 0.23 16.439)', primaryForeground: 'oklch(0.985 0 0)' },
  { id: 'orange', name: 'Orange', primary: 'oklch(0.7 0.18 55.934)', primaryForeground: 'oklch(0.985 0 0)' },
  { id: 'amber', name: 'Amber', primary: 'oklch(0.77 0.16 70.083)', primaryForeground: 'oklch(0.985 0 0)' },
  { id: 'cyan', name: 'Cyan', primary: 'oklch(0.68 0.16 196.271)', primaryForeground: 'oklch(0.985 0 0)' },
  { id: 'indigo', name: 'Indigo', primary: 'oklch(0.55 0.23 264.364)', primaryForeground: 'oklch(0.985 0 0)' },
]

function applyAccentColor(accentId: string) {
  const color = ACCENT_COLORS.find(c => c.id === accentId)
  if (color && typeof document !== 'undefined') {
    document.documentElement.style.setProperty('--primary', color.primary)
    document.documentElement.style.setProperty('--primary-foreground', color.primaryForeground)
    document.documentElement.setAttribute('data-theme', accentId)
  }
}

export function ThemeInitializer() {
  const { userId } = useAuth()

  useEffect(() => {
    async function loadAccentColor() {
      if (!userId) return

      const supabase = createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('accent_color')
        .eq('clerk_user_id', userId)
        .single()

      if (profile?.accent_color) {
        applyAccentColor(profile.accent_color)
      }
    }

    loadAccentColor()
  }, [userId])

  return null
}