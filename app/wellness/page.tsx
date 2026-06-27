import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function WellnessPage() {
  return (
    <ListingIndexPage
      type="wellness"
      activeSlug="wellness"
      title="Wellness"
      subtitle="Yoga, healing, recovery, breathwork, and feel-good island rituals."
      emptyMessage="No published wellness listings yet."
    />
  )
}
