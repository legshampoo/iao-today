import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'event-images'
const MAX_SIZE_BYTES = 1 * 1024 * 1024

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export function validateEventImageRequired(
  imageFile: File | null,
  existingImageUrl: string | null | undefined,
  removeImage: boolean
): string | null {
  if (imageFile) {
    return null
  }

  if (existingImageUrl && !removeImage) {
    return null
  }

  return 'An image is required.'
}

export function validateEventImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Please upload a JPEG, PNG, WebP, or GIF image.'
  }

  if (file.size > MAX_SIZE_BYTES) {
    return 'Image must be smaller than 1 MB.'
  }

  return null
}

export function eventImagePath(userId: string, eventId: string, file: File) {
  const ext = EXTENSIONS[file.type] ?? 'jpg'
  return `${userId}/${eventId}.${ext}`
}

export function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = url.indexOf(marker)

  if (index === -1) {
    return null
  }

  return url.slice(index + marker.length)
}

export async function uploadEventImage(
  supabase: SupabaseClient,
  userId: string,
  eventId: string,
  file: File
) {
  const path = eventImagePath(userId, eventId, file)

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) {
    if (error.message.toLowerCase().includes('bucket not found')) {
      throw new Error(
        'Storage bucket "event-images" was not found. Create a public bucket with that exact name in Supabase → Storage.'
      )
    }

    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteEventImage(
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
