import type { Config, Plugin } from 'payload'
import type { PayloadEventsPluginConfig, SanitizedPayloadEventsConfig } from './types'
import { createPayloadEventsCollection } from './collection'
import { createAfterChangeHook, createAfterDeleteHook } from './hooks'
import { createSSEEndpoint } from './endpoint'
import { startCleanupJob } from './cleanup'

const DEFAULT_CONFIG: SanitizedPayloadEventsConfig = {
  collections: 'all',
  retentionMs: 60 * 60 * 1000, // 1 hour
  pollIntervalMs: 1000, // 1 second
  disabled: false,
  admin: {},
}

const sanitizeConfig = (options?: PayloadEventsPluginConfig): SanitizedPayloadEventsConfig => ({
  collections: options?.collections ?? 'all',
  retentionMs: options?.retentionMs ?? DEFAULT_CONFIG.retentionMs,
  pollIntervalMs: options?.pollIntervalMs ?? DEFAULT_CONFIG.pollIntervalMs,
  disabled: options?.disabled ?? DEFAULT_CONFIG.disabled,
  admin: options?.admin ?? DEFAULT_CONFIG.admin,
})

export const payloadEventsPlugin =
  (options?: PayloadEventsPluginConfig): Plugin =>
  (incomingConfig: Config): Config => {
    const config = sanitizeConfig(options)

    // Always add the events collection (for schema consistency)
    const collections = [
      ...(incomingConfig.collections || []),
      createPayloadEventsCollection(config.admin),
    ]

    // Get collection slugs to add hooks to
    const targetCollections =
      config.collections === 'all'
        ? incomingConfig.collections?.map((c) => c.slug) || []
        : config.collections

    // Always include payload-jobs if it exists
    const allTargetSlugs = new Set([...targetCollections, 'payload-jobs'])

    // Add hooks to target collections
    const collectionsWithHooks = collections.map((collection) => {
      // Skip the events collection itself
      if (collection.slug === 'payload-events') return collection

      // Skip if not in target collections
      if (!allTargetSlugs.has(collection.slug)) return collection

      return {
        ...collection,
        hooks: {
          ...collection.hooks,
          afterChange: [
            ...(collection.hooks?.afterChange || []),
            createAfterChangeHook(collection.slug, config),
          ],
          afterDelete: [
            ...(collection.hooks?.afterDelete || []),
            createAfterDeleteHook(collection.slug, config),
          ],
        },
      }
    })

    // Add SSE endpoint
    const endpoints = [...(incomingConfig.endpoints || []), createSSEEndpoint(config)]

    // Set up onInit for cleanup job
    const incomingOnInit = incomingConfig.onInit
    const onInit = async (payload: any) => {
      if (incomingOnInit) await incomingOnInit(payload)

      // Start cleanup job
      startCleanupJob(payload, config)

      payload.logger.info('[payload-events] Plugin initialized')
    }

    return {
      ...incomingConfig,
      collections: collectionsWithHooks,
      endpoints,
      onInit,
    }
  }
