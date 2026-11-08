import './Button.css'

/** Reusable action button with semantic variants and native button props. */
function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) {
  const classes = [
    'ui-button',
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? 'ui-button--full-width' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && <span className="ui-button__spinner" aria-hidden="true" />}
      <span className={loading ? 'ui-button__content ui-button__content--loading' : 'ui-button__content'}>
        {children}
      </span>
    </button>
  )
}

export default Button