'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type {
  PayloadEvent,
  PayloadEventsStatus,
  SubscribeCallback,
  UsePayloadEventsReturn,
} from '../types'

const MAX_RECONNECT_DELAY = 30000 // 30 seconds
const INITIAL_RECONNECT_DELAY = 1000 // 1 second

export function usePayloadEvents(): UsePayloadEventsReturn {
  const [status, setStatus] = useState<PayloadEventsStatus>('disconnected')
  const [error, setError] = useState<Error | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const lastEventIdRef = useRef<string | null>(null)
  const reconnectDelayRef = useRef(INITIAL_RECONNECT_DELAY)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscriptionsRef = useRef<Map<string, Set<SubscribeCallback>>>(new Map())

  const handleEvent = useCallback((event: PayloadEvent) => {
    subscriptionsRef.current.forEach((callbacks, key) => {
      // key is '*' for all events, or comma-separated event names
      if (key === '*' || key.split(',').includes(event.name)) {
        callbacks.forEach((cb) => cb(event))
      }
    })
  }, [])

  const connect = useCallback(() => {
    // Build URL
    const url = new URL('/api/_events/stream', window.location.origin)
    if (lastEventIdRef.current) {
      url.searchParams.set('lastEventId', lastEventIdRef.current)
    }

    setStatus('connecting')
    setError(null)

    const eventSource = new EventSource(url.toString())
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      setStatus('connected')
      setError(null)
      // Reset reconnect delay on successful connection
      reconnectDelayRef.current = INITIAL_RECONNECT_DELAY
    }

    eventSource.addEventListener('change', (e: MessageEvent) => {
      try {
        const event: PayloadEvent = JSON.parse(e.data)
        lastEventIdRef.current = event.id
        handleEvent(event)
      } catch (err) {
        console.error('[payload-events] Failed to parse event:', err)
      }
    })

    eventSource.onerror = () => {
      eventSource.close()
      eventSourceRef.current = null
      setStatus('error')
      setError(new Error('SSE connection error'))

      // Schedule reconnect with exponential backoff
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectDelayRef.current = Math.min(reconnectDelayRef.current * 2, MAX_RECONNECT_DELAY)
        connect()
      }, reconnectDelayRef.current)
    }
  }, [handleEvent])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    setStatus('disconnected')
  }, [])

  const subscribe = useCallback(
    (eventNames: string[] | null, callback: SubscribeCallback): (() => void) => {
      const key = eventNames?.sort().join(',') || '*'

      if (!subscriptionsRef.current.has(key)) {
        subscriptionsRef.current.set(key, new Set())
      }
      subscriptionsRef.current.get(key)!.add(callback)

      // Return unsubscribe function
      return () => {
        subscriptionsRef.current.get(key)?.delete(callback)
        // Clean up empty sets
        if (subscriptionsRef.current.get(key)?.size === 0) {
          subscriptionsRef.current.delete(key)
        }
      }
    },
    [],
  )

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return { subscribe, status, error }
}
