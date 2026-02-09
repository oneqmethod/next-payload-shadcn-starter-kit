import type { CollectionConfig, CollectionAdminOptions } from 'payload'

const DEFAULT_ADMIN: Partial<CollectionAdminOptions> = {
  group: 'System',
  hidden: true,
  defaultColumns: ['name', 'createdAt'],
}

export const createPayloadEventsCollection = (
  adminOverrides?: Partial<CollectionAdminOptions>,
): CollectionConfig => ({
  slug: 'payload-events',
  admin: {
    ...DEFAULT_ADMIN,
    ...adminOverrides,
  },
  access: {
    // Only admins can read events via API
    read: ({ req }) => Boolean(req.user),
    // Events created only via hooks (internal)
    create: () => false,
    update: () => false,
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'payload',
      type: 'json',
      required: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
})
