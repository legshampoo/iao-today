import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function RestaurantsPage() {
  return (
    <ListingIndexPage
      type="restaurant"
      activeSlug="restaurants"
      title="Restaurants"
      subtitle="Cafes, local eats, beach bars, and places to eat around the island."
      emptyMessage="No published restaurants yet."
    />
  )
}
