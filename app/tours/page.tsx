import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function ToursPage() {
  return (
    <ListingIndexPage
      type="tour"
      activeSlug="tours"
      title="Tours"
      subtitle="Island hopping, adventures, and guided experiences."
      emptyMessage="No published tours yet."
    />
  )
}
