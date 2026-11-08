import './Card.css'

/** Framed content surface with optional header and footer regions. */
function Card({ children, title, description, footer, padding = 'medium', className = '', ...props }) {
  const classes = ['ui-card', `ui-card--${padding}`, className].filter(Boolean).join(' ')

  return (
    <section className={classes} {...props}>
      {(title || description) && (
        <header className="ui-card__header">
          {title && <h2 className="ui-card__title">{title}</h2>}
          {description && <p className="ui-card__description">{description}</p>}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
      {footer && <footer className="ui-card__footer">{footer}</footer>}
    </section>
  )
}

export default Card