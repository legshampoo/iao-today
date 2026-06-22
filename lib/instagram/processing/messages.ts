import { HumanMessage } from '@langchain/core/messages'
import type { InstagramPostRow } from '@/lib/instagram/types'

export function buildVisionMessage(
  text: string,
  imageUrl: string | null
): HumanMessage {
  if (!imageUrl) {
    return new HumanMessage(text)
  }

  return new HumanMessage({
    content: [
      { type: 'text', text },
      { type: 'image_url', image_url: { url: imageUrl } },
    ],
  })
}

export function buildPostContext(post: InstagramPostRow): string {
  return `@${post.account_username} · ${post.post_url ?? post.post_id}`
}
