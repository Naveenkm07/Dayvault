'use client'

import { User } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { updateProfile } from '@/app/actions/settings'
import { Loader2, Download } from 'lucide-react'

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

export function SettingsClient({ user, profile }: { user: User, profile: Profile }) {
  const { setTheme, theme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    name: profile.name || '',
    accent_color: profile.accent_color || 'blue',
  })

  // Apply saved accent color on mount and when accent color changes
  useEffect(() => {
    applyAccentColor(formData.accent_color)
  }, [formData.accent_color])

  async function handleSave() {
    setIsSaving(true)
    const result = await updateProfile({
      name: formData.name,
      theme: theme || 'system',
      accent_color: formData.accent_color
    })
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Settings saved successfully')
      applyAccentColor(formData.accent_color)
    }
    setIsSaving(false)
  }

  async function handleExport() {
    toast.info('Exporting data...')
    try {
      const res = await fetch('/api/export')
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `dayvault-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
        toast.success('Data exported successfully')
      } else {
        toast.error('Export failed')
      }
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user.email} disabled />
            <p className="text-xs text-muted-foreground">Your email is used for login and cannot be changed here.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input 
              id="name" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Your name" 
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how DAYVAULT looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Theme Mode</Label>
            <RadioGroup 
              defaultValue={theme} 
              onValueChange={setTheme}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="light" id="light" className="peer sr-only" />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Light
                </Label>
              </div>
              <div>
                <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Dark
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Accent Color</Label>
            <div className="flex flex-wrap gap-4">
              {ACCENT_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => {
                    setFormData({...formData, accent_color: color.id})
                    applyAccentColor(color.id)
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ring-offset-background transition-all hover:scale-110 ${formData.accent_color === color.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''}`}
                  style={{ backgroundColor: color.primary }}
                  title={color.name}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Select a color to personalize your experience. Click Save Changes to keep it.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your personal data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Download a copy of your journal entries, plans, and tags in JSON format.
            Photos are not included in this export.
          </p>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export JSON Backup
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
