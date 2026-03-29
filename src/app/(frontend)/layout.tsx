import { Geist, Geist_Mono } from 'next/font/google'

import { ReactNode } from 'react'
import { DirectionProvider } from '@/components/ui/direction'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AgentationDevTool } from '@/components/agentation-dev-tool'

import './styles.css'

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

import { cn } from '@/lib/utils'

const direction = 'ltr' as const

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: ReactNode }) {
  const { children } = props

  return (
    <html
      lang="en"
      dir={direction}
      suppressHydrationWarning
      className={cn('antialiased', fontMono.variable, 'font-sans', fontSans.variable)}
    >
      <body>
        <DirectionProvider>
          <ThemeProvider>
            <main>{children}</main>
            <Toaster />
            <AgentationDevTool />
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  )
}
