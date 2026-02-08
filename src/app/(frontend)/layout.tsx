import React from 'react'

import { DirectionProvider } from '@/components/ui/direction'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

import './styles.css'

const direction = 'ltr' as const

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'Payload Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en" dir={direction} suppressHydrationWarning>
      <body>
        <DirectionProvider dir={direction}>
          <ThemeProvider>
            <main>{children}</main>
            <Toaster />
          </ThemeProvider>
        </DirectionProvider>
      </body>
    </html>
  )
}
