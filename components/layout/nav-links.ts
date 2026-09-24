import { House, Notebook, Calendar as CalendarIcon, CheckSquare, Clock, Search, Settings } from 'lucide-react'

export const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: House },
  { name: 'Journal', href: '/journal', icon: Notebook },
  { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
  { name: 'Plans', href: '/plans', icon: CheckSquare },
  { name: 'Timeline', href: '/timeline', icon: Clock },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
]
