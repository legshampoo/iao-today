import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function DiscountsPage() {
  return (
    <ListingIndexPage
      type="discount"
      activeSlug="discounts"
      title="Discounts"
      subtitle="Limited-time deals, promos, and local offers worth checking today."
      emptyMessage="No published discounts yet."
    />
  )
}
