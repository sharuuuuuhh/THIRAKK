import 'server-only'

import { createHmac } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { supabaseAdmin, isConfigured } from '@/lib/supabase-admin'

export async function getAuthenticatedReporter(request: NextRequest) {
  if (!isConfigured) return { user: null, deviceHash: null, error: 'server_not_configured' as const }

  const authorization = request.headers.get('authorization')
  const match = authorization?.match(/^Bearer\s+(.+)$/i)
  if (!match) return { user: null, deviceHash: null, error: 'unauthorized' as const }

  const { data, error } = await supabaseAdmin.auth.getUser(match[1])
  if (error || !data.user) return { user: null, deviceHash: null, error: 'unauthorized' as const }

  const deviceHash = createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
    .update(data.user.id)
    .digest('hex')

  return { user: data.user, deviceHash, error: null }
}
