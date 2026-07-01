function normalizeSiteUrl(url: string) {
  return url.replace(/\/$/, '')
}

export function resolvePublicSiteUrl(requestOrigin?: string) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (configured) {
    return normalizeSiteUrl(configured)
  }

  if (requestOrigin) {
    return normalizeSiteUrl(requestOrigin)
  }

  throw new Error('NEXT_PUBLIC_SITE_URL is required for auth email links.')
}

export function getAuthCallbackUrl(next = '/', requestOrigin?: string) {
  const safeNext = next.startsWith('/') ? next : '/'
  const base = resolvePublicSiteUrl(requestOrigin)

  return `${base}/auth/callback?next=${encodeURIComponent(safeNext)}`
}
