import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'listing-images'
const MAX_SIZE_BYTES = 5 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

function extensionFromContentType(contentType: string | null): string {
  if (!contentType) {
    return 'jpg'
  }

  return EXTENSIONS[contentType.split(';')[0].trim()] ?? 'jpg'
}

export async function downloadInstagramImage(
  imageUrl: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const response = await fetch(imageUrl)

  if (!response.ok) {
    throw new Error(`Failed to download image (${response.status}).`)
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (buffer.byteLength > MAX_SIZE_BYTES) {
    throw new Error('Instagram image exceeds 5 MB limit.')
  }

  return { buffer, contentType }
}

export function instagramEventImagePath(postId: string, contentType: string) {
  const ext = extensionFromContentType(contentType)
  return `instagram/${postId}.${ext}`
}

export async function uploadInstagramEventImage(
  supabase: SupabaseClient,
  postId: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const path = instagramEventImagePath(postId, contentType)

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    upsert: true,
    contentType: contentType.split(';')[0].trim(),
  })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
