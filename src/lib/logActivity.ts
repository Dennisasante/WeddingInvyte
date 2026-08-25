export async function logActivity({
  weddingId,
  action,
  entityType,
  entityId,
  details,
}: {
  weddingId?: string
  action: string
  entityType?: string
  entityId?: string
  details?: Record<string, unknown>
}) {
  try {
    await fetch('/api/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weddingId, action, entityType, entityId, details }),
    })
  } catch {
    // Never let logging break the main flow
  }
}
