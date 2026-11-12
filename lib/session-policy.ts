// Session lifetime rules. Supabase refresh tokens never expire by default,
// so the app enforces its own limits in middleware.

export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days since login
export const SESSION_IDLE_TIMEOUT_SECONDS = 24 * 60 * 60 // 24h without activity

export const LAST_ACTIVITY_COOKIE = 'rt_last_activity'

export const lastActivityCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_IDLE_TIMEOUT_SECONDS,
}

export function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

type AmrClaim = Array<{ timestamp?: number } | string> | undefined

// The `amr` claim of the Supabase JWT records when the user authenticated in
// this session. It is signed, so the client cannot tamper with it.
export function getSessionStartedAt(amr: AmrClaim): number | null {
  if (!Array.isArray(amr)) return null
  const timestamps = amr
    .map((entry) => (typeof entry === 'object' ? entry.timestamp : undefined))
    .filter((t): t is number => typeof t === 'number')
  return timestamps.length > 0 ? Math.min(...timestamps) : null
}

export function isSessionExpired(
  sessionStartedAt: number | null,
  lastActivity: number | null,
  now: number = nowInSeconds()
): boolean {
  if (sessionStartedAt !== null && now - sessionStartedAt > SESSION_MAX_AGE_SECONDS) {
    return true
  }
  // A missing activity cookie means it already expired in the browser
  // (or the session predates this policy).
  if (lastActivity === null || now - lastActivity > SESSION_IDLE_TIMEOUT_SECONDS) {
    return true
  }
  return false
}
