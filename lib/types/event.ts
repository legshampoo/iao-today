export type Event = {
  id: string
  user_id: string
  title: string
  description: string
  location: string
  starts_at: string
  ends_at: string | null
  is_free: boolean
  price_php: number | null
  created_at: string
  updated_at: string
}
