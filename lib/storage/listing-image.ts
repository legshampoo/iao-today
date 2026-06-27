import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'listing-images'
const MAX_SIZE_BYTES = 2 * 1024 * 1024

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function validateListingImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Please upload a JPEG, PNG, WebP, or GIF image.'
  }

  if (file.size > MAX_SIZE_BYTES) {
    return 'Image must be smaller than 2 MB.'
  }

  return null
}

export function listingImagePath(userId: string, listingId: string, file: File) {
  const ext = EXTENSIONS[file.type] ?? 'jpg'
  return `${userId}/${listingId}.${ext}`
}

export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = url.indexOf(marker)

  if (index === -1) {
    return null
  }

  return url.slice(index + marker.length)
}

export async function uploadListingImage(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  file: File
) {
  const path = listingImagePath(userId, listingId, file)

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    if (error.message.toLowerCase().includes('bucket not found')) {
      throw new Error(
        'Storage bucket "listing-images" was not found. Create a public bucket with that exact name in Supabase → Storage.'
      )
    }

    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteListingImage(
  supabase: SupabaseClient,
  imageUrl: string | null | undefined
) {
  if (!imageUrl) {
    return
  }

  const path = pathFromPublicUrl(imageUrl)

  if (!path) {
    return
  }

  await supabase.storage.from(BUCKET).remove([path])
}
