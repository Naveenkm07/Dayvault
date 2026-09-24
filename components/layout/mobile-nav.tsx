'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { navLinks } from './nav-links'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

export function MobileNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn('flex items-center px-2 py-2 overflow-x-auto gap-2', className)}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex flex-col items-center justify-center min-w-[70px] py-2 rounded-md transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <link.icon className="w-5 h-5 mb-1" />
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  )
}
