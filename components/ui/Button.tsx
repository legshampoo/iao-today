import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonStyleOptions } from '@/lib/ui/button'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<ButtonStyleOptions, 'className'> & {
    className?: string
  }

export function Button({
  variant,
  size,
  shape,
  fullWidth,
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, shape, fullWidth, className })}
      {...props}
    />
  )
}
