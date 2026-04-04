import { createClient } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'

export async function getAuthUser(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request)
  return user
}
