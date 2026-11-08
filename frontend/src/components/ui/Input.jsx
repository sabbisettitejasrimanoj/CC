import { forwardRef, useId } from 'react'
import './Input.css'

/** Labeled input field that forwards all native input props and its ref. */
const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}, ref) {
  const generatedId = useId()
  const inputId = id || `ui-input-${generatedId}`
  const message = error || helperText

  return (
    <div className={`ui-input ${className}`}>
      {label && <label className="ui-input__label" htmlFor={inputId}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={`ui-input__control${error ? ' ui-input__control--error' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={message ? `${inputId}-message` : undefined}
        {...props}
      />
      {message && <p id={`${inputId}-message`} className={`ui-input__message${error ? ' ui-input__message--error' : ''}`}>{message}</p>}
    </div>
  )
})

export default Input