/**
 * InputField Component
 * 
 * A reusable input component that supports labels, placeholders,
 * different input types, and error states.
 * 
 * Usage Examples:
 * <InputField label="Name" placeholder="Enter your name" />
 * <InputField label="Email" type="email" placeholder="your@email.com" />
 * <InputField label="Password" type="password" error="Password is required" />
 */

import './InputField.css'

/**
 * InputField Component
 * 
 * @param {string} label - The label text above the input
 * @param {string} placeholder - Placeholder text inside the input
 * @param {string} type - Input type (text, email, password, number, tel, etc.)
 * @param {string} value - Current input value
 * @param {function} onChange - Function called when input value changes
 * @param {string} error - Error message to display below the input
 * @param {string} id - Unique ID for the input (auto-generated if not provided)
 * @param {string} className - Optional additional CSS classes
 * @param {boolean} disabled - Whether the input is disabled
 * @param {boolean} required - Whether the input is required
 */
function InputField({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  id,
  className = '',
  disabled = false,
  required = false,
}) {
  // Generate unique ID if not provided
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`

  return (
    <div className={`input-field ${error ? 'input-field-error' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className="input-field-label">
          {label}
          {required && <span className="input-field-required">*</span>}
        </label>
      )}

      {/* Input Element */}
      <input
        id={inputId}
        type={type}
        className={`input-field-input ${error ? 'input-field-input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />

      {/* Error Message */}
      {error && (
        <span id={`${inputId}-error`} className="input-field-error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}

export default InputField