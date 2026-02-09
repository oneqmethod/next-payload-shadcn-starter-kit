import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import type { CRUDEventPayload, PayloadEventOperation, SanitizedPayloadEventsConfig } from './types'

const createEventRecord = async (
  payload: any,
  name: string,
  eventPayload: CRUDEventPayload,
  context: Record<string, unknown>,
) => {
  // Prevent infinite loops - don't track events for the events collection
  if (eventPayload.collection === 'payload-events') return
  // Skip if already processing an event
  if (context.skipPayloadEvents) return

  try {
    await payload.create({
      collection: 'payload-events',
      data: {
        name,
        payload: eventPayload,
      },
      context: { skipPayloadEvents: true },
    })
  } catch (error) {
    payload.logger.error(`[payload-events] Failed to create event: ${error}`)
  }
}

export const createAfterChangeHook = (
  collectionSlug: string,
  config: SanitizedPayloadEventsConfig,
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, context }) => {
    if (config.disabled) return doc

    const op: PayloadEventOperation = operation === 'create' ? 'create' : 'update'
    const eventName = `${collectionSlug}.${op}`

    await createEventRecord(
      req.payload,
      eventName,
      {
        collection: collectionSlug,
        operation: op,
        documentId: String(doc.id),
        document: doc,
      },
      context,
    )

    return doc
  }
}

export const createAfterDeleteHook = (
  collectionSlug: string,
  config: SanitizedPayloadEventsConfig,
): CollectionAfterDeleteHook => {
  return async ({ doc, req, context }) => {
    if (config.disabled) return doc

    const eventName = `${collectionSlug}.delete`

    await createEventRecord(
      req.payload,
      eventName,
      {
        collection: collectionSlug,
        operation: 'delete',
        documentId: String(doc.id),
        document: doc,
      },
      context,
    )

    return doc
  }
}
