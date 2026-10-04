import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeInitializer } from '@/components/theme-initializer'
import { ClerkProviderWrapper } from '@/components/clerk-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DAYVAULT',
  description: 'Your days. Your memories. Your plans.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <ClerkProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <ThemeInitializer />
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </ClerkProviderWrapper>
      </body>
    </html>
  )
}
