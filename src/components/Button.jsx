/**
 * Consolidates what were ~20 slightly different hand-written button class
 * strings across the site (different padding, different disabled opacity,
 * different text sizes for what was meant to be the same button) into
 * three deliberate size tiers and two intent variants. Matches the
 * dominant existing convention (bg-gold/text-espresso primary, rounded-full,
 * disabled:opacity-40) rather than inventing a new look.
 *
 * This is a plain <button> or <a> depending on whether an `href` is passed
 * (for cases that need to be a real link, e.g. a WhatsApp deep link),
 * so it works as a drop-in replacement either way.
 */

const sizeClasses = {
  small: 'px-4 py-2 text-xs',
  default: 'px-6 py-3 text-sm',
  large: 'px-8 py-4 text-base',
}

const variantClasses = {
  primary: 'bg-gold text-espresso hover:bg-gold-light',
  outline: 'border border-gold/30 text-espresso dark:text-cream hover:border-gold',
  ghost: 'text-gold hover:underline',
}

function Button({
  as,
  href,
  size = 'default',
  variant = 'primary',
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const base = `font-sans font-medium rounded-full transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-40 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`

  if (as === 'a' || href) {
    return (
      <a href={href} className={base} {...rest}>
        {children}
      </a>
    )
  }

  return (
    <button disabled={disabled} className={base} {...rest}>
      {children}
    </button>
  )
}

export default Button