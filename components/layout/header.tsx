'use client'

import { usePathname } from 'next/navigation'
import { UserMenu } from './user-menu'
import { ThemeToggle } from '../theme-toggle'
import { Search } from 'lucide-react'
import { buttonVariants } from '../ui/button'
import Link from 'next/link'

export function Header() {
  const pathname = usePathname()
  
  // Create a nice title from the pathname
  const title = pathname.split('/')[1] || 'dashboard'
  const displayTitle = title.charAt(0).toUpperCase() + title.slice(1)

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">{displayTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/search" className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <Search className="w-5 h-5" />
            <span className="sr-only">Search</span>
        </Link>
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  )
}
