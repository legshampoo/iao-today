import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function StayPage() {
  return (
    <ListingIndexPage
      type="accommodation"
      activeSlug="stay"
      title="Stay"
      subtitle="Hotels, villas, hostels, and places to sleep after a full Siargao day."
      emptyMessage="No published accommodation listings yet."
    />
  )
}
