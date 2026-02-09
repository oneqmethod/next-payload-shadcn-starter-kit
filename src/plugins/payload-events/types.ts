import type { CollectionSlug, CollectionAdminOptions } from 'payload'
import type { ReactNode } from 'react'

export interface PayloadEventsPluginConfig {
  /**
   * Collections to broadcast events for.
   * Default: all collections + 'payload-jobs'
   */
  collections?: CollectionSlug[]
  /**
   * Event retention period in milliseconds.
   * Default: 3600000 (1 hour)
   */
  retentionMs?: number
  /**
   * Polling interval for SSE endpoint in milliseconds.
   * Default: 1000 (1 second)
   */
  pollIntervalMs?: number
  /**
   * Disable plugin (keeps collection for schema consistency).
   * Default: false
   */
  disabled?: boolean
  /**
   * Admin panel configuration for events collection.
   * Default: { hidden: true, group: 'System' }
   */
  admin?: Partial<CollectionAdminOptions>
}

export interface SanitizedPayloadEventsConfig {
  collections: CollectionSlug[] | 'all'
  retentionMs: number
  pollIntervalMs: number
  disabled: boolean
  admin: Partial<CollectionAdminOptions>
}

export interface PayloadEvent {
  id: string
  name: string
  payload: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export type PayloadEventOperation = 'create' | 'update' | 'delete'

export interface CRUDEventPayload {
  collection: string
  operation: PayloadEventOperation
  documentId: string
  document: Record<string, unknown>
}

export type SubscribeCallback = (event: PayloadEvent) => void

export type PayloadEventsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface UsePayloadEventsReturn {
  subscribe: (eventNames: string[] | null, callback: SubscribeCallback) => () => void
  status: PayloadEventsStatus
  error: Error | null
}

export interface SSEProps {
  eventNames?: string[] | null
  enabled?: boolean
  children: (event: PayloadEvent | null, status: PayloadEventsStatus) => ReactNode
}
