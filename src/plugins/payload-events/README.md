# Payload Events Plugin

Real-time event broadcasting for Payload CMS using Server-Sent Events (SSE).

## Purpose

Provides a turnkey real-time layer on top of Payload CMS. Collections get automatic CRUD event broadcasting; custom events are created via `publish()`. Clients consume events through an SSE stream with React hooks or the `<SSE>` render-prop component.

## Architecture

```
payload.config.ts
  └─ payloadEventsPlugin(options)
       ├─ Adds `payload-events` collection (collection.ts)
       ├─ Attaches afterChange/afterDelete hooks to target collections (hooks.ts)
       ├─ Registers SSE endpoint at /api/_events/stream (endpoint.ts)
       └─ Starts cleanup job on init (cleanup.ts)

Client (browser)
  └─ usePayloadEvents() / <SSE> / PayloadEventsProvider
       └─ EventSource → /api/_events/stream
            └─ Server polls `payload-events` collection on interval
```

### Data Flow

1. Document CRUD triggers `afterChange` / `afterDelete` hook
2. Hook writes a record to the `payload-events` collection (skips if `disabled` or infinite-loop guard triggers)
3. SSE endpoint polls the collection at `pollIntervalMs` intervals, streams new records to connected clients
4. Client-side `usePayloadEvents()` parses SSE messages and dispatches to matching subscribers
5. Cleanup job runs every 5 minutes, deleting events older than `retentionMs`

## Key Files

| File                           | Description                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| `plugin.ts`                    | Plugin factory -- sanitizes config, wires collection/hooks/endpoint/cleanup           |
| `collection.ts`                | `payload-events` collection definition (fields: `name`, `payload`; timestamps)        |
| `hooks.ts`                     | `afterChange` / `afterDelete` hook factories for CRUD event creation                  |
| `endpoint.ts`                  | SSE streaming endpoint (`/api/_events/stream`) with polling                           |
| `cleanup.ts`                   | Periodic deletion of expired events (5-min interval)                                  |
| `types.ts`                     | All TypeScript interfaces and type aliases                                            |
| `index.ts`                     | Server re-exports: `payloadEventsPlugin`, types                                       |
| `client/use-payload-events.ts` | `usePayloadEvents()` hook -- EventSource management, reconnect, subscription dispatch |
| `client/provider.tsx`          | `PayloadEventsProvider` context + `usePayloadEventsContext()`                         |
| `client/sse.tsx`               | `<SSE>` render-prop component                                                         |
| `client/publish.ts`            | `publish()` server action for custom events                                           |
| `client/index.ts`              | Client re-exports: hooks, components, types                                           |

## Dependencies

- **Payload CMS** -- collection API, hooks, endpoints, `onInit`
- **React 19** -- hooks, context, server actions
- **Web Streams API** -- `ReadableStream` for SSE response
- **EventSource** -- browser-native SSE client

## Setup

```ts
// payload.config.ts
import { payloadEventsPlugin } from './plugins/payload-events'

export default buildConfig({
  plugins: [
    payloadEventsPlugin({
      // Show in admin panel (default: hidden)
      admin: { hidden: false },
      // Collections to track (default: all)
      collections: ['tasks', 'projects'],
      // Event retention (default: 1 hour)
      retentionMs: 60 * 60 * 1000,
      // SSE poll interval (default: 1 second)
      pollIntervalMs: 1000,
    }),
  ],
})
```

## Event Schema

```ts
interface PayloadEvent {
  id: string
  name: string // Event name (e.g., 'tasks.create')
  payload: Record<string, unknown> // Any JSON data
  createdAt: string
  updatedAt: string
}
```

### CRUD Events

Automatically created when documents are created, updated, or deleted:

```ts
// Event name format: collection.operation
{
  name: 'tasks.create',
  payload: {
    collection: 'tasks',
    operation: 'create',
    documentId: '6968ebbf31f10a1ccbe84c79',
    document: { id: '...', title: 'My Task', status: 'backlog', ... }
  }
}
```

### Custom Events

Create any event with `publish()`:

```ts
{
  name: 'notification.sent',
  payload: { userId: '123', message: 'Hello!' }
}
```

## API Reference

### `usePayloadEvents()`

React hook that connects to SSE and provides a subscribe function.

```ts
import { usePayloadEvents } from '@/plugins/payload-events/client'

function MyComponent() {
  const { subscribe, status, error } = usePayloadEvents()

  useEffect(() => {
    // Subscribe to specific events
    const unsubscribe = subscribe(['tasks.create', 'tasks.update'], (event) => {
      console.log('Task changed:', event.payload)
    })

    return unsubscribe
  }, [subscribe])

  return <div>Status: {status}</div>
}
```

#### Returns

| Property    | Type                                                                      | Description                                                                    |
| ----------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `subscribe` | `(eventNames: string[] \| null, callback: (event) => void) => () => void` | Subscribe to events. Pass `null` for all events. Returns unsubscribe function. |
| `status`    | `'connecting' \| 'connected' \| 'disconnected' \| 'error'`                | Connection status                                                              |
| `error`     | `Error \| null`                                                           | Last error if any                                                              |

### `PayloadEventsProvider` / `usePayloadEventsContext()`

Context provider that shares a single `usePayloadEvents()` instance across the component tree. Use this when multiple components need SSE subscriptions to avoid opening duplicate EventSource connections.

```tsx
import { PayloadEventsProvider, usePayloadEventsContext } from '@/plugins/payload-events/client'

// Wrap once in layout
function Layout({ children }: { children: React.ReactNode }) {
  return <PayloadEventsProvider>{children}</PayloadEventsProvider>
}

// Consume anywhere below
function TaskWatcher() {
  const { subscribe, status } = usePayloadEventsContext()
  // ...same API as usePayloadEvents()
}
```

> **Recommended:** Wrap your root layout with `PayloadEventsProvider` and use `usePayloadEventsContext()` everywhere. This ensures a single SSE connection shared across all components. Only use `usePayloadEvents()` directly for isolated components outside the provider tree.

### `<SSE>`

Component with render prop pattern for easy integration.

```tsx
import { SSE } from '@/plugins/payload-events/client'

function TaskList() {
  return (
    <SSE eventNames={['tasks.create', 'tasks.update', 'tasks.delete']}>
      {(event, status) => (
        <div>
          <p>Connection: {status}</p>
          {event && (
            <p>
              Last event: {event.name} at {event.createdAt}
            </p>
          )}
        </div>
      )}
    </SSE>
  )
}
```

#### Props

| Prop         | Type                           | Default  | Description                                 |
| ------------ | ------------------------------ | -------- | ------------------------------------------- |
| `eventNames` | `string[] \| null`             | `null`   | Events to subscribe to. `null` = all events |
| `enabled`    | `boolean`                      | `true`   | Enable/disable subscription                 |
| `children`   | `(event, status) => ReactNode` | required | Render function                             |

### `publish()`

Server action to create custom events.

```ts
import { publish } from '@/plugins/payload-events/client'

// In a server action or API route
async function sendNotification(userId: string, message: string) {
  await publish('notification.sent', {
    userId,
    message,
    sentAt: new Date().toISOString(),
  })
}
```

#### Parameters

| Parameter | Type                      | Description |
| --------- | ------------------------- | ----------- |
| `name`    | `string`                  | Event name  |
| `payload` | `Record<string, unknown>` | Event data  |

## Examples

### Auto-refresh on changes (throttled)

Calling `router.refresh()` on every event can cause excessive re-renders under high event volume. Throttle with a counter so rapid events are batched into a single refresh:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePayloadEventsContext } from '@/plugins/payload-events/client'
import { useThrottle } from '@/hooks/use-throttle'

export function AutoRefresh() {
  const router = useRouter()
  const { subscribe } = usePayloadEventsContext()
  const [eventCount, setEventCount] = useState(0)
  const throttledCount = useThrottle(eventCount)

  // Increment counter on any event
  useEffect(() => {
    return subscribe(null, () => {
      setEventCount((c) => c + 1)
    })
  }, [subscribe])

  // Refresh only when throttled counter changes
  useEffect(() => {
    if (throttledCount > 0) {
      router.refresh()
    }
  }, [throttledCount, router])

  return null
}
```

### Real-time notifications

```tsx
'use client'

import { useEffect, useState } from 'react'
import { usePayloadEvents, PayloadEvent } from '@/plugins/payload-events/client'

export function NotificationToast() {
  const { subscribe, status } = usePayloadEvents()
  const [notifications, setNotifications] = useState<PayloadEvent[]>([])

  useEffect(() => {
    return subscribe(['notification.sent'], (event) => {
      setNotifications((prev) => [...prev, event])

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== event.id))
      }, 5000)
    })
  }, [subscribe])

  return (
    <div className="fixed bottom-4 right-4 space-y-2">
      {notifications.map((n) => (
        <div key={n.id} className="bg-blue-500 text-white p-4 rounded">
          {n.payload.message as string}
        </div>
      ))}
    </div>
  )
}
```

### Job tracking with stateful events

Track background jobs by subscribing to custom lifecycle events (`job.started`, `job.completed`, `job.failed`). Maintain a `Map` of active jobs and show toasts on completion:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { usePayloadEventsContext } from '@/plugins/payload-events/client'
import type { PayloadEvent } from '@/plugins/payload-events/types'

interface ActiveJob {
  jobId: string
  type: string
  label: string
  startedAt: number
}

export function JobTracker() {
  const { subscribe } = usePayloadEventsContext()
  const [jobs, setJobs] = useState<Map<string, ActiveJob>>(new Map())

  useEffect(() => {
    return subscribe(['job.started', 'job.completed', 'job.failed'], (event: PayloadEvent) => {
      const { jobId, type, label } = event.payload as {
        jobId: string
        type: string
        label?: string
      }

      if (event.name === 'job.started') {
        setJobs((prev) => {
          const next = new Map(prev)
          next.set(jobId, { jobId, type, label: label ?? 'Processing...', startedAt: Date.now() })
          return next
        })
      } else {
        setJobs((prev) => {
          const next = new Map(prev)
          next.delete(jobId)
          return next
        })

        if (event.name === 'job.completed') {
          toast.success(label ?? 'Job completed')
        } else {
          const error = (event.payload as { error?: string }).error
          toast.error(label ?? 'Job failed', { description: error })
        }
      }
    })
  }, [subscribe])

  if (jobs.size === 0) return null

  return (
    <div>
      {jobs.size} job{jobs.size !== 1 ? 's' : ''} running
    </div>
  )
}
```

### Connection status indicator

```tsx
import { SSE } from '@/plugins/payload-events/client'

export function ConnectionStatus() {
  return (
    <SSE>
      {(_, status) => (
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'connected'
                ? 'bg-green-500'
                : status === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
            }`}
          />
          <span className="text-sm text-gray-500">{status === 'connected' ? 'Live' : status}</span>
        </div>
      )}
    </SSE>
  )
}
```

### Trigger custom event from form

```tsx
'use client'

import { publish } from '@/plugins/payload-events/client'

export function BroadcastForm() {
  async function handleSubmit(formData: FormData) {
    'use server'

    const message = formData.get('message') as string

    await publish('broadcast.message', {
      message,
      sentBy: 'admin',
      sentAt: new Date().toISOString(),
    })
  }

  return (
    <form action={handleSubmit}>
      <input name="message" placeholder="Broadcast message..." />
      <button type="submit">Send</button>
    </form>
  )
}
```

## SSE Endpoint

The plugin exposes an SSE endpoint at `/api/_events/stream`.

**Query Parameters:**

| Parameter     | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| `events`      | Comma-separated event names to filter (e.g., `?events=tasks.create,tasks.update`) |
| `lastEventId` | Resume from specific event ID                                                     |

**Example:**

```
GET /api/_events/stream?events=tasks.create,tasks.update
```

## Plugin Options

| Option           | Type                              | Default            | Description                           |
| ---------------- | --------------------------------- | ------------------ | ------------------------------------- |
| `collections`    | `string[]`                        | All collections    | Collections to track for CRUD events  |
| `retentionMs`    | `number`                          | `3600000` (1 hour) | How long to keep events               |
| `pollIntervalMs` | `number`                          | `1000` (1 second)  | SSE polling interval                  |
| `disabled`       | `boolean`                         | `false`            | Disable event creation (keeps schema) |
| `admin`          | `Partial<CollectionAdminOptions>` | `{ hidden: true }` | Admin panel config                    |

## Patterns

### Infinite-loop prevention

Hooks set `context.skipPayloadEvents = true` when creating event records, so the event collection's own `afterChange` does not recurse. Events for the `payload-events` collection slug are also explicitly skipped.

### `payload-jobs` auto-tracking

The plugin always adds `payload-jobs` to the set of tracked collections (in addition to configured ones) so job lifecycle changes are broadcast automatically.

### Reconnection

`usePayloadEvents()` reconnects with exponential backoff: 1 s initial delay, doubling up to 30 s max. Delay resets on successful connection.

### Collection access control

| Operation | Rule                                                       |
| --------- | ---------------------------------------------------------- |
| `read`    | Authenticated users only                                   |
| `create`  | Denied (internal hooks / `publish()` use `overrideAccess`) |
| `update`  | Denied                                                     |
| `delete`  | Authenticated users only                                   |

### `disabled` mode

When `disabled: true`, hooks and cleanup are no-ops but the `payload-events` collection is still registered to keep the database schema consistent.
