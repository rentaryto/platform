import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { LAST_ACTIVITY_COOKIE } from '@/lib/session-policy'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()

  const response = NextResponse.json({ success: true })
  response.cookies.delete(LAST_ACTIVITY_COOKIE)
  return response
}
