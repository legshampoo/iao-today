export type InstagramAccount = {
  username: string
  is_active: boolean
  last_scraped_at: string | null
  created_at: string
}

export type ScrapedPost = {
  id: string
  caption: string | null
  timestamp: string | null
  url: string | null
  mediaType: string | null
  imageUrl: string | null
}

export type AccountScrapeResult = {
  username: string
  scrapedAt: string
  posts: ScrapedPost[]
}

export type ScrapeTriggerResult =
  | {
      ok: true
      batchId: string | null
      accountCount: number
      started: Array<{ username: string; runId: string }>
      failed: Array<{ username: string; error: string }>
    }
  | { ok: false; error: string }

export type ApifyRunResource = {
  id: string
  defaultDatasetId?: string
  status?: string
}

export type ApifyWebhookPayload = {
  eventType?: string
  resource?: ApifyRunResource
}

export type ApifyPostItem = {
  shortCode?: string
  id?: string
  caption?: string
  timestamp?: string
  url?: string
  type?: string
  displayUrl?: string
  ownerUsername?: string
  childPosts?: Array<{
    displayUrl?: string
    type?: string
  }>
}

export type ClassificationResult = {
  isEvent: boolean
  reason: string
}

export type ExtractedEventFields = {
  title: string
  description: string
  location: string
  starts_at: string
  ends_at: string | null
  time_tbc: boolean
  is_free: boolean
  price_php: number | null
}

export type InstagramPostRow = {
  post_id: string
  account_username: string
  caption: string | null
  post_url: string | null
  media_type: string | null
  image_url: string | null
  post_timestamp: string | null
  scraped_at: string
  processing_status:
    | 'pending'
    | 'processing'
    | 'processed'
    | 'skipped'
    | 'failed'
  event_id: string | null
  llm_result: Record<string, unknown> | null
  error_message: string | null
  processed_at: string | null
}

export type ProcessingGraphState = {
  post: InstagramPostRow
  classification: ClassificationResult | null
  extractedEvents: ExtractedEventFields[] | null
  skipReason: string | null
  eventIds: string[]
  llmResult: Record<string, unknown>
  error: string | null
}
