import Image from 'next/image'

type EventImageProps = {
  src: string
  alt: string
  className?: string
  sizes?: string
  priority?: boolean
  fit?: 'cover' | 'native'
}

export function EventImage({
  src,
  alt,
  className,
  sizes = '100vw',
  priority = false,
  fit = 'cover',
}: EventImageProps) {
  if (fit === 'native') {
    return (
      <Image
        src={src}
        alt={alt}
        width={0}
        height={0}
        sizes={sizes}
        priority={priority}
        className={className ?? 'h-auto w-full'}
        style={{ width: '100%', height: 'auto' }}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className={className ?? 'object-cover'}
      sizes={sizes}
      priority={priority}
    />
  )
}
