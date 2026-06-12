import { useNavigate } from 'react-router-dom'
import './Header.css'

function Header({ title, showBack = false, onBack }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className="header">
      <div className="header-content">
        {showBack && (
          <button className="header-back" onClick={handleBack} aria-label="Go back">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="header-brand">
          <span className="header-logo">🌿</span>
          <span className="header-title">NYURVEDA</span>
        </div>
        {title && <h1 className="header-page-title">{title}</h1>}
      </div>
    </header>
  )
}

export default Header