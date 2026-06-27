import { ListingCard } from '@/components/ListingCard'
import type { ListingWithDetails } from '@/lib/types/listing'

type ListingGridProps = {
  listings: ListingWithDetails[]
}

export function ListingGrid({ listings }: ListingGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
