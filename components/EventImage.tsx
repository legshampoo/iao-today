import Image from 'next/image'

type EventImageProps = {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
}

export function EventImage({
  src,
  alt,
  className = 'object-cover',
  sizes = '100vw',
  priority = false,
}: EventImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className}
      sizes={sizes}
      priority={priority}
    />
  )
}
