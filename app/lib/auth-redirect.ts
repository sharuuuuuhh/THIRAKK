const AUTH_DESTINATIONS = new Set([
  '/report',
  '/contributions',
  '/volunteer',
  '/auth/reset-password',
])

/** Restrict post-auth navigation to app routes so `next` cannot become an open redirect. */
export function getSafeAuthDestination(candidate: string | null | undefined): string {
  if (!candidate || !candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return '/'
  }

  try {
    const destination = new URL(candidate, 'https://thirakku.invalid')
    if (destination.origin !== 'https://thirakku.invalid' || !AUTH_DESTINATIONS.has(destination.pathname)) {
      return '/'
    }
    return `${destination.pathname}${destination.search}`
  } catch {
    return '/'
  }
}
