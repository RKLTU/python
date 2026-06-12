import './Card.css'

function Card({ children, className = '', variant = 'default', onClick }) {
  const cardClass = `card card-${variant} ${className}`.trim()

  return (
    <div className={cardClass} onClick={onClick}>
      {children}
    </div>
  )
}

export default Card