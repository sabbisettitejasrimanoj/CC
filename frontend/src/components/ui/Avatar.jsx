import './Avatar.css'

/** User avatar that falls back to initials when no image is available. */
function Avatar({ src, alt = '', name = '', size = 'medium', className = '', ...props }) {
  const initials = name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <span className={`ui-avatar ui-avatar--${size} ${className}`} {...props}>
      {src ? <img src={src} alt={alt || name} /> : <span aria-hidden="true">{initials || '?'}</span>}
    </span>
  )
}

export default Avatar