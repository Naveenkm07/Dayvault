import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background">
      <Sidebar className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 border-r bg-card z-10" />
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileNav className="lg:hidden fixed bottom-0 inset-x-0 border-t bg-card z-50 pb-safe" />
    </div>
  )
}
