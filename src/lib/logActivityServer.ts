import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function logActivityServer({
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await adminSupabase.from('activity_log').insert({
      wedding_id: weddingId || null,
      actor_id: user?.id || null,
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || null,
    })
  } catch {
    // Never let logging break the main flow
  }
}
