import { NextResponse } from 'next/server'
import type { Annotation } from 'agentation'

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface WebhookPayload {
  event: string
  timestamp: number
  url: string
  annotation: Annotation
}

function buildDescription(payload: WebhookPayload) {
  const { annotation, url } = payload
  const lines: string[] = []

  if (annotation.comment) {
    lines.push(`## Comment\n${annotation.comment}`)
  }

  if (url) {
    lines.push(`## Page\n${url}`)
  }

  if (annotation.elementPath || annotation.element) {
    const parts: string[] = []
    if (annotation.element) parts.push(`Element: \`${annotation.element}\``)
    if (annotation.elementPath) parts.push(`CSS Path: \`${annotation.elementPath}\``)
    if (annotation.fullPath) parts.push(`Full Path: \`${annotation.fullPath}\``)
    lines.push(`## Element\n${parts.join('\n')}`)
  }

  if (annotation.cssClasses) {
    lines.push(`## CSS Classes\n\`${annotation.cssClasses}\``)
  }

  if (annotation.nearbyText) {
    lines.push(`## Nearby Text\n${annotation.nearbyText}`)
  }

  if (annotation.reactComponents) {
    lines.push(`## React Components\n\`${annotation.reactComponents}\``)
  }

  if (annotation.selectedText) {
    lines.push(`## Selected Text\n> ${annotation.selectedText}`)
  }

  if (annotation.severity) {
    lines.push(`## Severity\n${annotation.severity}`)
  }

  const other: string[] = []
  if (annotation.computedStyles) other.push(`**Computed Styles:** \`${annotation.computedStyles}\``)
  if (annotation.nearbyElements) other.push(`**Nearby Elements:** \`${annotation.nearbyElements}\``)
  if (annotation.accessibility) other.push(`**Accessibility:** ${annotation.accessibility}`)
  if (annotation.isFixed) other.push(`**Fixed Position:** yes`)
  if (other.length > 0) {
    lines.push(`## Other\n${other.join('\n')}`)
  }

  lines.push(`\n---\n*Created from Agentation annotation \`${annotation.id}\`*`)

  return lines.join('\n\n')
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const payload = (await request.json()) as WebhookPayload
  console.log('Received Agentation webhook:', payload)

  if (payload.event !== 'annotation.add') {
    return NextResponse.json({ message: `Ignored event: ${payload.event}` }, { status: 200 })
  }

  const brainshopUrl = process.env.BRAINSHOP_URL
  const brainshopToken = process.env.BRAINSHOP_TOKEN
  const brainshopProjectId = process.env.BRAINSHOP_PROJECT_ID

  if (!brainshopUrl || !brainshopToken) {
    return NextResponse.json({ error: 'Missing Brainshop config' }, { status: 500 })
  }

  const { annotation } = payload

  const intentPrefix = annotation.intent ? `${capitalize(annotation.intent)}: ` : ''
  const title = `${intentPrefix}${annotation.comment ?? 'Untitled annotation'}`.slice(0, 100)

  const description = buildDescription(payload)

  const response = await fetch(`${brainshopUrl}/api/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `users API-Key ${brainshopToken}`,
    },
    body: JSON.stringify({
      title,
      description,
      ...(brainshopProjectId ? { project: brainshopProjectId } : {}),
    }),
  })

  const result = await response.json()
  return NextResponse.json(result, { status: response.status })
}
