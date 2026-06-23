type EventPricingFields = {
  title: string
  description: string
  is_free: boolean
  price_php: number | null
}

export function parsePricePhp(value: unknown): number | null {
  if (value == null || value === '') {
    return null
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[₱,\s]/g, '').replace(/php/gi, '')
    const match = cleaned.match(/(\d+(?:\.\d{1,2})?)/)

    if (!match) {
      return null
    }

    const parsed = Number(match[1])
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
  }

  return null
}

export function extractPriceFromText(...texts: string[]): number | null {
  const patterns = [
    /₱\s*([\d,]+(?:\.\d{2})?)/i,
    /(?:php|pesos?)\s*([\d,]+(?:\.\d{2})?)/i,
    /([\d,]+(?:\.\d{2})?)\s*(?:php|pesos?)/i,
    /\bp\s*([\d,]+(?:\.\d{2})?)\b/i,
    /(?:entrance|cover|door|drop[- ]?in|rate|fee|ticket|session|class)[:\s-]*₱?\s*([\d,]+(?:\.\d{2})?)/i,
  ]

  for (const text of texts) {
    for (const pattern of patterns) {
      const match = text.match(pattern)

      if (!match) {
        continue
      }

      const parsed = parsePricePhp(match[1])

      if (parsed != null && parsed > 0) {
        return parsed
      }
    }
  }

  return null
}

export function normalizeEventPricing<T extends EventPricingFields>(event: T): T {
  let pricePhp =
    parsePricePhp(event.price_php) ??
    extractPriceFromText(event.description, event.title)

  if (pricePhp != null && pricePhp > 0) {
    return { ...event, is_free: false, price_php: pricePhp }
  }

  if (event.is_free) {
    return { ...event, is_free: true, price_php: null }
  }

  return { ...event, is_free: false, price_php: null }
}
