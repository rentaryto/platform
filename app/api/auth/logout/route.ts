import { createClient } from '@/lib/supabase-route-handler'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { supabase, response } = await createClient(request)
  await supabase.auth.signOut()

  return NextResponse.json(
    { success: true },
    {
      headers: response.headers,
    }
  )
}
