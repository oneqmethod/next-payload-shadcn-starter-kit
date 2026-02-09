'use client'

import { createContext, useContext } from 'react'
import { usePayloadEvents } from './use-payload-events'
import type { UsePayloadEventsReturn } from '../types'

const PayloadEventsContext = createContext<UsePayloadEventsReturn | null>(null)

export function PayloadEventsProvider({ children }: { children: React.ReactNode }) {
  const events = usePayloadEvents()
  return <PayloadEventsContext.Provider value={events}>{children}</PayloadEventsContext.Provider>
}

export function usePayloadEventsContext(): UsePayloadEventsReturn {
  const ctx = useContext(PayloadEventsContext)
  if (!ctx) throw new Error('usePayloadEventsContext must be used within PayloadEventsProvider')
  return ctx
}
