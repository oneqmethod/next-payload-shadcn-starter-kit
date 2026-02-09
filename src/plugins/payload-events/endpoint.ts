import type { Endpoint, Where } from 'payload'
import type { PayloadEvent, SanitizedPayloadEventsConfig } from './types'

export const createSSEEndpoint = (config: SanitizedPayloadEventsConfig): Endpoint => ({
  path: '/_events/stream',
  method: 'get',
  handler: async (req) => {
    if (!req.url) {
      return new Response('Bad Request', { status: 400 })
    }

    const url = new URL(req.url)
    const eventsParam = url.searchParams.get('events')
    const lastEventIdParam = url.searchParams.get('lastEventId') || req.headers.get('Last-Event-ID')

    // Parse events filter
    const eventsFilter = eventsParam ? eventsParam.split(',') : null

    // Track last sent event ID
    let lastEventId = lastEventIdParam || null

    // Create readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        const connectionTime = new Date()

        // Send initial connection message
        controller.enqueue(encoder.encode(': connected\n\n'))

        // Polling function
        const poll = async () => {
          try {
            // Build where clause
            const whereConditions: Where[] = []

            if (lastEventId) {
              whereConditions.push({ id: { greater_than: lastEventId } })
            } else {
              whereConditions.push({ createdAt: { greater_than_equal: connectionTime } })
            }

            if (eventsFilter && eventsFilter.length > 0) {
              whereConditions.push({ name: { in: eventsFilter } })
            }

            const where: Where = whereConditions.length > 0 ? { and: whereConditions } : {}

            // Query new events (cast to any since collection is added by plugin)
            // Use overrideAccess since this is an internal plugin operation
            const events = await (req.payload as any).find({
              collection: 'payload-events',
              where,
              sort: 'createdAt',
              limit: 100,
              overrideAccess: true,
            })

            // Send events
            for (const event of events.docs as PayloadEvent[]) {
              const eventData = {
                id: event.id,
                name: event.name,
                payload: event.payload,
                createdAt: event.createdAt,
              }

              const message = `id: ${event.id}\nevent: change\ndata: ${JSON.stringify(eventData)}\n\n`
              controller.enqueue(encoder.encode(message))

              lastEventId = String(event.id)
            }
          } catch (error) {
            req.payload.logger.error(`[payload-events] SSE poll error: ${error}`)
          }
        }

        // Initial poll
        await poll()

        // Set up polling interval
        const interval = setInterval(poll, config.pollIntervalMs)

        // Handle client disconnect
        req.signal?.addEventListener('abort', () => {
          clearInterval(interval)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    })
  },
})
