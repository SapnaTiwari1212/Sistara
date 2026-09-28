import { forwardRef } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Button that can render as <button>, <Link> or <a> without duplicating
 * styles at the call site.
 */
const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  grape: 'btn-grape',
  ghost: 'btn-ghost',
}

const SIZES = {
  sm: 'btn-sm',
  md: '',
  lg: 'min-h-[56px] px-8 text-lg',
}

const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      to,
      href,
      className = '',
      loading = false,
      disabled = false,
      icon: Icon,
      iconRight: IconRight,
      fullWidth = false,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const classes = cn(
      VARIANTS[variant] || VARIANTS.primary,
      SIZES[size],
      fullWidth && 'w-full',
      loading && 'pointer-events-none opacity-70',
      className,
    )

    const content = (
      <>
        {loading ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden="true" />
        ) : (
          Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">{children}</span>
        {IconRight && !loading && (
          <IconRight className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        )}
      </>
    )

    if (to) {
      return (
        <Link ref={ref} to={to} className={cn(classes, 'group')} {...rest}>
          {content}
        </Link>
      )
    }

    if (href) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn(classes, 'group')}
          target="_blank"
          rel="noreferrer noopener"
          {...rest}
        >
          {content}
        </a>
      )
    }

    return (
      <button
        ref={ref}
        type={type}
        className={cn(classes, 'group')}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {content}
      </button>
    )
  },
)

Button.displayName = 'Button'

export default Button
