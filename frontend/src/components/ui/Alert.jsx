import { useState } from 'react'
import './Alert.css'

/** Feedback message with an optional dismiss action. */
function Alert({ children, title, variant = 'info', dismissible = false, onDismiss, className = '', ...props }) {
  const [visible, setVisible] = useState(true)
  const dismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  if (!visible) return null

  return (
    <div className={`ui-alert ui-alert--${variant} ${className}`} role={variant === 'danger' ? 'alert' : 'status'} {...props}>
      <div className="ui-alert__content">
        {title && <strong className="ui-alert__title">{title}</strong>}
        <div>{children}</div>
      </div>
      {dismissible && <button className="ui-alert__dismiss" type="button" aria-label="Dismiss alert" onClick={dismiss}>&times;</button>}
    </div>
  )
}

export default Alert