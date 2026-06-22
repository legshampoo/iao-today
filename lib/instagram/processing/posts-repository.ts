import { createAdminClient } from '@/lib/supabase/admin'
import type { AccountScrapeResult, ScrapedPost } from '@/lib/instagram/types'

function toPostRow(username: string, post: ScrapedPost) {
  return {
    post_id: post.id,
    account_username: username,
    caption: post.caption,
    post_url: post.url,
    media_type: post.mediaType,
    image_url: post.imageUrl,
    post_timestamp: post.timestamp,
    scraped_at: new Date().toISOString(),
    processing_status: 'pending' as const,
  }
}

export async function saveScrapedPosts(
  result: AccountScrapeResult
): Promise<string[]> {
  const supabase = createAdminClient()
  const postIdsToProcess: string[] = []

  for (const post of result.posts) {
    const { data: existing, error: existingError } = await supabase
      .from('instagram_posts')
      .select('post_id, processing_status')
      .eq('post_id', post.id)
      .maybeSingle()

    if (existingError) {
      throw new Error(
        `Failed to check instagram_posts for ${post.id}: ${existingError.message}`
      )
    }

    if (existing?.processing_status === 'processed') {
      continue
    }

    if (existing?.processing_status === 'processing') {
      continue
    }

    const row = toPostRow(result.username, post)

    const { error } = await supabase.from('instagram_posts').upsert(row, {
      onConflict: 'post_id',
      ignoreDuplicates: false,
    })

    if (error) {
      throw new Error(`Failed to save instagram post ${post.id}: ${error.message}`)
    }

    postIdsToProcess.push(post.id)
  }

  return postIdsToProcess
}

export async function getInstagramPost(postId: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('instagram_posts')
    .select('*')
    .eq('post_id', postId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load instagram post ${postId}: ${error.message}`)
  }

  return data
}

export async function markPostProcessing(postId: string): Promise<boolean> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('instagram_posts')
    .update({
      processing_status: 'processing',
      error_message: null,
    })
    .eq('post_id', postId)
    .in('processing_status', ['pending', 'failed'])
    .select('post_id')
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to mark post processing ${postId}: ${error.message}`)
  }

  return Boolean(data)
}

export async function markPostSkipped(
  postId: string,
  llmResult: Record<string, unknown>
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('instagram_posts')
    .update({
      processing_status: 'skipped',
      llm_result: llmResult,
      processed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('post_id', postId)

  if (error) {
    throw new Error(`Failed to mark post skipped ${postId}: ${error.message}`)
  }
}

export async function markPostProcessed(
  postId: string,
  eventId: string,
  llmResult: Record<string, unknown>
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('instagram_posts')
    .update({
      processing_status: 'processed',
      event_id: eventId,
      llm_result: llmResult,
      processed_at: new Date().toISOString(),
      error_message: null,
    })
    .eq('post_id', postId)

  if (error) {
    throw new Error(`Failed to mark post processed ${postId}: ${error.message}`)
  }
}

export async function markPostFailed(postId: string, errorMessage: string) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('instagram_posts')
    .update({
      processing_status: 'failed',
      error_message: errorMessage,
      processed_at: new Date().toISOString(),
    })
    .eq('post_id', postId)

  if (error) {
    console.error(`Failed to mark post failed ${postId}:`, error.message)
  }
}
