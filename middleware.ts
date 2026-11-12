import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import {
  LAST_ACTIVITY_COOKIE,
  getSessionStartedAt,
  isSessionExpired,
  lastActivityCookieOptions,
  nowInSeconds,
} from '@/lib/session-policy'

// Auth endpoints manage their own session cookies
const UNCHECKED_API_PATHS = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')

  if (UNCHECKED_API_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Refreshed tokens must reach both the downstream handler and the browser
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (!claims) {
    if (pathname.startsWith('/dashboard')) {
      return withCookies(NextResponse.redirect(new URL('/login', request.url)), response)
    }
    return response
  }

  const lastActivityRaw = Number(request.cookies.get(LAST_ACTIVITY_COOKIE)?.value)
  const lastActivity = Number.isFinite(lastActivityRaw) && lastActivityRaw > 0 ? lastActivityRaw : null
  const sessionStartedAt = getSessionStartedAt(claims.amr)

  if (isSessionExpired(sessionStartedAt, lastActivity)) {
    await supabase.auth.signOut({ scope: 'local' })
    response.cookies.delete(LAST_ACTIVITY_COOKIE)

    if (isApi) {
      return withCookies(
        NextResponse.json({ error: 'Sesión caducada' }, { status: 401 }),
        response
      )
    }
    if (pathname === '/login') {
      return response
    }
    return withCookies(NextResponse.redirect(new URL('/login?expired=true', request.url)), response)
  }

  if (pathname === '/login') {
    return withCookies(NextResponse.redirect(new URL('/dashboard', request.url)), response)
  }

  response.cookies.set(LAST_ACTIVITY_COOKIE, String(nowInSeconds()), lastActivityCookieOptions)
  return response
}

function withCookies(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie))
  return target
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/:path*'],
}
