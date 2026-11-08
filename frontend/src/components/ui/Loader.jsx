import './Loader.css'

/** Loading indicator with an accessible status label. */
function Loader({ size = 'medium', label = 'Loading', className = '' }) {
  return <span className={`ui-loader ui-loader--${size} ${className}`} role="status" aria-label={label} />
}

export default Loader