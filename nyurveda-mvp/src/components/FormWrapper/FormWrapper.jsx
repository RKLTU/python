/**
 * FormWrapper Component
 * 
 * A reusable component that wraps forms with consistent styling.
 * Provides centered card layout with title section and responsive design.
 * 
 * Usage Example:
 * <FormWrapper title="Your Title" subtitle="Optional description">
 *   <form>...</form>
 * </FormWrapper>
 */

import './FormWrapper.css'

/**
 * FormWrapper Component
 * 
 * @param {string} title - The main heading for the form
 * @param {string} subtitle - Optional description text below the title
 * @param {React.ReactNode} children - The form content to wrap
 * @param {string} className - Optional additional CSS classes
 */
function FormWrapper({ 
  title, 
  subtitle, 
  children, 
  className = '' 
}) {
  return (
    <div className={`form-wrapper ${className}`}>
      {/* Form Card Container */}
      <div className="form-wrapper-card">
        {/* Title Section */}
        {(title || subtitle) && (
          <div className="form-wrapper-header">
            {title && <h2 className="form-wrapper-title">{title}</h2>}
            {subtitle && <p className="form-wrapper-subtitle">{subtitle}</p>}
          </div>
        )}

        {/* Form Content */}
        <div className="form-wrapper-content">
          {children}
        </div>
      </div>
    </div>
  )
}

export default FormWrapper