'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ListingCard } from '@/components/ListingCard'
import type { ListingWithDetails } from '@/lib/types/listing'
import { buttonClasses } from '@/lib/ui/button'

type DashboardListingsProps = {
  listings: ListingWithDetails[]
}

type TabKey = 'published' | 'drafts'

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" />
      <path d="M3 9.5h18M8 3v3M16 3v3" />
    </svg>
  )
}

export function DashboardListings({ listings }: DashboardListingsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('published')

  const published = listings.filter((listing) => listing.status === 'published')
  const drafts = listings.filter((listing) => listing.status !== 'published')
  const visible = activeTab === 'published' ? published : drafts

  const tabs: Array<{ key: TabKey; label: string; count: number }> = [
    { key: 'published', label: 'Published', count: published.length },
    { key: 'drafts', label: 'Drafts', count: drafts.length },
  ]

  return (
    <div>
      <div className="flex w-full rounded-xl border border-zinc-200 bg-zinc-100 p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-zinc-400">{tab.count}</span>
              )}
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div className="mt-10 flex flex-col items-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
            <CalendarIcon />
          </div>
          <h2 className="mt-5 text-lg font-semibold tracking-tight text-zinc-950">
            {activeTab === 'published'
              ? 'Start sharing your listings'
              : 'No drafts yet'}
          </h2>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-zinc-500">
            {activeTab === 'published'
              ? 'Create your first listing and connect with the community. It only takes a few minutes.'
              : 'Listings you save as drafts will appear here until you publish them.'}
          </p>
          <Link
            href="/dashboard/listings/new"
            className={buttonClasses({ shape: 'pill', className: 'mt-6 px-5 py-3' })}
          >
            <span className="text-base leading-none">+</span>
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              href={`/dashboard/listings/${listing.id}/edit`}
              status={listing.status}
            />
          ))}
        </div>
      )}
    </div>
  )
}
