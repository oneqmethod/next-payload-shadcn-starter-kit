'use client'

import { useEffect, useState } from 'react'
import { usePayloadEvents } from './use-payload-events'
import type { PayloadEvent, SSEProps } from '../types'

export function SSE({ eventNames = null, enabled = true, children }: SSEProps) {
  const { subscribe, status } = usePayloadEvents()
  const [lastEvent, setLastEvent] = useState<PayloadEvent | null>(null)

  useEffect(() => {
    if (!enabled) return
    return subscribe(eventNames, setLastEvent)
  }, [subscribe, eventNames, enabled])

  return <>{children(lastEvent, status)}</>
}
