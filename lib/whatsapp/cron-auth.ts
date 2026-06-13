export function isCronAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return false
  }

  if (request.headers.get('authorization') === `Bearer ${cronSecret}`) {
    return true
  }

  const { searchParams } = new URL(request.url)
  return searchParams.get('key') === cronSecret
}
