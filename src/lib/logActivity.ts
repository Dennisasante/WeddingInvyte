import { createClient } from '@/lib/supabase/client'

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
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('activity_log').insert({
    wedding_id: weddingId || null,
    actor_id: user.id,
    action,
    entity_type: entityType || null,
    entity_id: entityId || null,
    details: details || null,
  })
}