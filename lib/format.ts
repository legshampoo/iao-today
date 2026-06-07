const PHT_TIMEZONE = 'Asia/Manila'

export function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function formatEventPrice(isFree: boolean, pricePhp: number | null): string {
  if (isFree) return 'Free'
  if (pricePhp == null) return 'Free'

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pricePhp)
}
