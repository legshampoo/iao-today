export type EventSource = 'manual' | 'instagram'

export type Event = {
  id: string
  user_id: string | null
  source: EventSource
  instagram_post_id: string | null
  title: string
  description: string
  location: string
  starts_at: string
  ends_at: string | null
  time_tbc: boolean
  is_free: boolean
  price_php: number | null
  image_url: string | null
  created_at: string
  updated_at: string
}
