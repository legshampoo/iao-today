import { instagramProcessingGraph } from '@/lib/instagram/processing/graph'
import {
  getInstagramPost,
  markPostFailed,
  markPostProcessed,
  markPostProcessing,
} from '@/lib/instagram/processing/posts-repository'
import type { InstagramPostRow } from '@/lib/instagram/types'

export type ProcessPostResult =
  | { ok: true; status: 'processed'; eventIds: string[]; postId: string }
  | { ok: true; status: 'skipped'; postId: string; reason: string }
  | { ok: true; status: 'already_processed'; postId: string }
  | { ok: false; postId: string; error: string }

function getSkipReason(result: {
  skipReason?: string | null
  classification?: { isEvent: boolean; reason: string } | null
}): string | null {
  if (result.skipReason) {
    return result.skipReason
  }

  if (result.classification && !result.classification.isEvent) {
    return result.classification.reason
  }

  return null
}

export async function processInstagramPost(
  postId: string
): Promise<ProcessPostResult> {
  const post = await getInstagramPost(postId)

  if (!post) {
    return { ok: false, postId, error: 'Instagram post not found.' }
  }

  if (post.processing_status === 'processed') {
    return { ok: true, status: 'already_processed', postId }
  }

  const claimed = await markPostProcessing(postId)

  if (!claimed) {
    return { ok: true, status: 'already_processed', postId }
  }

  try {
    const result = await instagramProcessingGraph.invoke({
      post: post as InstagramPostRow,
    })

    const skipReason = getSkipReason(result)

    if (skipReason) {
      console.log('[instagram-process] skipped', { postId, reason: skipReason })

      return {
        ok: true,
        status: 'skipped',
        postId,
        reason: skipReason,
      }
    }

    if (!result.eventIds || result.eventIds.length === 0) {
      throw new Error('Processing finished without creating any events.')
    }

    await markPostProcessed(postId, result.eventIds[0], {
      ...result.llmResult,
      eventIds: result.eventIds,
    })

    console.log('[instagram-process] created events', {
      postId,
      eventIds: result.eventIds,
      titles: result.extractedEvents?.map((event) => event.title),
    })

    return {
      ok: true,
      status: 'processed',
      postId,
      eventIds: result.eventIds,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    await markPostFailed(postId, message)
    console.error(`[instagram-process] failed for ${postId}:`, message)

    return { ok: false, postId, error: message }
  }
}

export async function processInstagramPosts(postIds: string[]) {
  const results = []

  for (const postId of postIds) {
    results.push(await processInstagramPost(postId))
  }

  return results
}
