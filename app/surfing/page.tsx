import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function SurfingPage() {
  return (
    <ListingIndexPage
      type="surfing"
      activeSlug="surfing"
      title="Surfing"
      subtitle="Lessons, board rentals, surf camps, and local guides across Siargao."
      emptyMessage="No published surfing listings yet."
    />
  )
}
