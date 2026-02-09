'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export async function publish(name: string, payload: Record<string, unknown>) {
  const payloadInstance = await getPayload({ config })

  return payloadInstance.create({
    collection: 'payload-events' as any,
    data: { name, payload },
    overrideAccess: true,
  })
}
