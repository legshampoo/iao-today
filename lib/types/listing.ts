export type ListingType =
  | 'event'
  | 'discount'
  | 'tour'
  | 'restaurant'
  | 'wellness'
  | 'accommodation'
  | 'surfing'
  | 'transportation'

export type ListingPriceType =
  | 'free'
  | 'paid'
  | 'donation'
  | 'contact'
  | 'varies'
  | 'not_listed'

export type ListingPriceUnit =
  | 'person'
  | 'night'
  | 'room'
  | 'group'
  | 'class'
  | 'session'
  | 'hour'
  | 'day'
  | 'fixed'
  | 'starting'

export type ListingStatus = 'draft' | 'published' | 'archived'

export type Listing = {
  id: string
  user_id: string | null
  title: string
  slug: string
  type: ListingType
  status: ListingStatus
  description: string | null
  image_url: string | null
  price_type: ListingPriceType
  currency: string
  price_amount: number | null
  price_amount_max: number | null
  price_unit: ListingPriceUnit | null
  price_label: string | null
  maps_url: string | null
  external_url: string | null
  instagram_url: string | null
  location_name: string | null
  area: string | null
  latitude: number | null
  longitude: number | null
  is_top_pick: boolean
  is_featured: boolean
  created_at: string
  updated_at: string
  published_at: string | null
}

export type EventDetails = {
  id: string
  listing_id: string
  starts_at: string | null
  ends_at: string | null
  date_label: string | null
  time_label: string | null
  is_recurring: boolean
  recurrence_rule: string | null
}

export type DiscountDetails = {
  id: string
  listing_id: string
  discount_label: string | null
  valid_from: string | null
  valid_until: string | null
  terms: string | null
}

export type ListingCategory = {
  id: string
  name: string
  slug: string
  icon: string | null
  created_at: string
}

export type ListingCategoryLink = {
  listing_id: string
  category_id: string
}

export type Profile = {
  id: string
  email: string | null
  admin: boolean
  created_at: string
  updated_at: string
}

export type ListingWithDetails = Listing & {
  event_details?: EventDetails | null
  discount_details?: DiscountDetails | null
  categories?: ListingCategory[]
}
