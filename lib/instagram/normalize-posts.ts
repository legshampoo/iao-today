import type {
  AccountScrapeResult,
  ApifyPostItem,
  ScrapedPost,
} from '@/lib/instagram/types'

function isReel(item: ApifyPostItem): boolean {
  if (item.type?.toLowerCase() === 'reel') {
    return true
  }

  return Boolean(item.url?.includes('/reel/'))
}

function getPostImageUrl(item: ApifyPostItem): string | null {
  if (item.type === 'Sidecar' && item.childPosts?.[0]?.displayUrl) {
    return item.childPosts[0].displayUrl
  }

  return item.displayUrl ?? null
}

function normalizePost(item: ApifyPostItem): ScrapedPost {
  return {
    id: item.shortCode ?? item.id ?? '',
    caption: item.caption ?? null,
    timestamp: item.timestamp ?? null,
    url: item.url ?? null,
    mediaType: item.type ?? null,
    imageUrl: getPostImageUrl(item),
  }
}

export function normalizeAccountPosts(
  username: string,
  items: ApifyPostItem[]
): AccountScrapeResult {
  const posts = items
    .filter((item) => !isReel(item))
    .filter((item) => item.shortCode || item.id)
    .map(normalizePost)

  return {
    username,
    scrapedAt: new Date().toISOString(),
    posts,
  }
}
