import type { Payload } from 'payload'
import type { SanitizedPayloadEventsConfig } from './types'

let cleanupInterval: NodeJS.Timeout | null = null

export const startCleanupJob = (payload: Payload, config: SanitizedPayloadEventsConfig) => {
  if (config.disabled) return

  const runCleanup = async () => {
    try {
      const cutoffDate = new Date(Date.now() - config.retentionMs)

      // Cast to any since collection is added by plugin
      const result = await (payload as any).delete({
        collection: 'payload-events',
        where: {
          createdAt: {
            less_than: cutoffDate.toISOString(),
          },
        },
      })

      if (result.docs && result.docs.length > 0) {
        payload.logger.info(`[payload-events] Cleaned up ${result.docs.length} old events`)
      }
    } catch (error) {
      payload.logger.error(`[payload-events] Cleanup error: ${error}`)
    }
  }

  // Run cleanup every 5 minutes
  const CLEANUP_INTERVAL = 5 * 60 * 1000

  // Initial cleanup
  runCleanup()

  // Set up interval
  cleanupInterval = setInterval(runCleanup, CLEANUP_INTERVAL)

  payload.logger.info(
    `[payload-events] Cleanup job started (retention: ${config.retentionMs}ms, interval: ${CLEANUP_INTERVAL}ms)`,
  )
}

export const stopCleanupJob = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
    cleanupInterval = null
  }
}
