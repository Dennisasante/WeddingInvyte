import { createClient } from '@supabase/supabase-js'

// Service-role client: bypasses row level security. Only ever import this
// from server code (route handlers, server components), never from a
// 'use client' file — the key must never reach the browser.
//
// Public, logged-out pages (RSVP, seat lookup, co-admin join) use this
// instead of the anon key, so the database can refuse the anon key any
// direct table access. Callers must look records up by an unguessable
// token/id and return only what that visitor should see.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        // Next.js caches server-side fetches by default, and these pages have
        // no cookies to make them dynamic — so without this an RSVP page could
        // show a stale answer, or an expired invite could still look valid.
        fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  )
}
