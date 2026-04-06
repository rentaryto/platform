import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()

    // Exchanges the code — this confirms the email in Supabase
    await supabase.auth.exchangeCodeForSession(code)

    // Sign out immediately so the user must log in manually.
    // We never auto-login after email confirmation.
    await supabase.auth.signOut()
  }

  // Redirect to login with a flag so the page can show a success banner
  return NextResponse.redirect(`${requestUrl.origin}/login?confirmed=true`)
}
