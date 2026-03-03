'use client'

import { Agentation } from 'agentation'

export function AgentationDevTool() {
  if (process.env.NODE_ENV !== 'development') return null
  return <Agentation webhookUrl="/api/agentation/webhook" />
}
