import { useEffect, useId } from 'react'
import './Modal.css'

/** Accessible dialog that closes on Escape and prevents background scrolling. */
function Modal({ isOpen, onClose, title, children, footer, size = 'medium', className = '' }) {
  const titleId = useId()

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="ui-modal" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className={`ui-modal__dialog ui-modal__dialog--${size} ${className}`} role="dialog" aria-modal="true" aria-labelledby={title ? titleId : undefined}>
        <div className="ui-modal__header">
          {title && <h2 id={titleId} className="ui-modal__title">{title}</h2>}
          <button className="ui-modal__close" type="button" aria-label="Close dialog" onClick={onClose}>&times;</button>
        </div>
        <div className="ui-modal__body">{children}</div>
        {footer && <footer className="ui-modal__footer">{footer}</footer>}
      </div>
    </div>
  )
}

export default Modal