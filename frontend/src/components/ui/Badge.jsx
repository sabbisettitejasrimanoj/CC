import './Badge.css'

/** Compact status label with semantic color variants. */
function Badge({ children, variant = 'neutral', size = 'medium', className = '', ...props }) {
  return <span className={`ui-badge ui-badge--${variant} ui-badge--${size} ${className}`} {...props}>{children}</span>
}

export default Badge