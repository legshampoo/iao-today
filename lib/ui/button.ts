export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'ghost'
  | 'link'
export type ButtonSize = 'sm' | 'md'
export type ButtonShape = 'rounded' | 'pill'

const BASE =
  'inline-flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-950 text-white hover:bg-zinc-800',
  secondary:
    'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400',
  success:
    'border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100',
  link: 'bg-transparent p-0 text-zinc-700 underline hover:text-zinc-950',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-sm',
}

const SHAPES: Record<ButtonShape, string> = {
  rounded: 'rounded-lg',
  pill: 'rounded-full',
}

export type ButtonStyleOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  fullWidth?: boolean
  className?: string
}

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  fullWidth = false,
  className = '',
}: ButtonStyleOptions = {}): string {
  const parts = [BASE, VARIANTS[variant]]

  // The link variant manages its own spacing/shape.
  if (variant !== 'link') {
    parts.push(SIZES[size], SHAPES[shape])
  }

  if (fullWidth) {
    parts.push('w-full')
  }

  if (className) {
    parts.push(className)
  }

  return parts.join(' ')
}
