const INSTAGRAM_USERNAME_PATTERN = /^[a-zA-Z0-9._]{1,30}$/

export function normalizeInstagramUsername(input: string): string {
  let username = input.trim()

  if (username.startsWith('@')) {
    username = username.slice(1).trim()
  }

  return username.toLowerCase()
}

export function isValidInstagramUsername(username: string): boolean {
  if (!INSTAGRAM_USERNAME_PATTERN.test(username)) {
    return false
  }

  if (/^[._]|[._]$|\.\./.test(username)) {
    return false
  }

  return true
}
