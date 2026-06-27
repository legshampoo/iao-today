import { ListingIndexPage } from '@/components/ListingIndexPage'

export default function EventsPage() {
  return (
    <ListingIndexPage
      type="event"
      activeSlug="events"
      title="Events"
      subtitle="Markets, music, yoga, pop-ups, and everything happening around Siargao."
      emptyMessage="No published events yet."
    />
  )
}
