import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function TransportationPage() {
  return (
    <ListingIndexPage
      type="transportation"
      activeSlug="transportation"
      title="Transportation"
      subtitle="Scooters, vans, boats, and airport transfers to get around the island."
      emptyMessage="No published transportation listings yet."
    />
  )
}
