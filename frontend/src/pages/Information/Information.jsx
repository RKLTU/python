import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../../hooks/useLocalStorage'
import { updateProfile } from '../../lib/backendApi'
import FormWrapper from '../../components/FormWrapper/FormWrapper'
import InputField from '../../components/InputField/InputField'
import Button from '../../components/Button/Button'
import ProgressBar from '../../components/ProgressBar/ProgressBar'
import './Information.css'

/**
 * Information Page Component
 * 
 * Collects user lifestyle and personal details for personalized
 * Ayurvedic wellness recommendations.
 * 
 * Features:
 * - First Name, Last Name fields
 * - Date of Birth input
 * - Gender dropdown (Male, Female)
 * - Lifestyle dropdown (Sedentary, Moderately Active, Highly Active)
 * - Form validation
 * - Saves data to localStorage
 * - Navigates to Concern page on success
 */
function Information() {
  const navigate = useNavigate()
  
  // Load existing user data from localStorage
  const [user] = useLocalStorage('nyurveda_user', { 
    firstName: '', 
    lastName: '', 
    isLoggedIn: false 
  })

  // Save information data to localStorage
  const [info, setInfo] = useLocalStorage('nyurveda_info', {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    dateOfBirth: '',
    gender: '',
    lifestyle: '',
  })

  // Form state management
  const [formData, setFormData] = useState({
    firstName: info.firstName || user.firstName || '',
    lastName: info.lastName || user.lastName || '',
    dateOfBirth: info.dateOfBirth || '',
    gender: info.gender || '',
    lifestyle: info.lifestyle || '',
  })

  // Error state for validation
  const [errors, setErrors] = useState({})

  /**
   * Handle input field changes
   * Updates form data and clears errors when user types
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  /**
   * Validate form fields
   * Checks if all required fields are filled
   */
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required'
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender'
    }
    
    if (!formData.lifestyle) {
      newErrors.lifestyle = 'Please select your lifestyle'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Loading state for API call
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle form submission
   * 1. Validates form
   * 2. Calls backend PUT /profile/{user_id} with personal info
   * 3. Saves to localStorage
   * 4. Navigates to Concern page
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Update profile via backend
      const userId = user.userId
      if (userId) {
        await updateProfile(userId, {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          date_of_birth: formData.dateOfBirth.trim(),
          gender: formData.gender,
          lifestyle: formData.lifestyle,
        })
      }

      // Save to localStorage
      setInfo({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        gender: formData.gender,
        lifestyle: formData.lifestyle,
      })

      // Navigate to Concern page
      navigate('/concern')
    } catch (error) {
      console.error('Failed to update profile:', error)
      // Still save locally and navigate even if backend fails
      setInfo({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth.trim(),
        gender: formData.gender,
        lifestyle: formData.lifestyle,
      })
      navigate('/concern')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="information-page">
      {/* Progress Bar */}
      <ProgressBar currentStep={2} totalSteps={4} />

      {/* Form Section */}
      <FormWrapper
        title="Tell Us About Yourself"
        subtitle={`Hi ${formData.firstName || 'there'}! This helps us personalize your Ayurvedic wellness recommendations.`}
      >
        <form className="information-form" onSubmit={handleSubmit}>
          {/* Name Fields - Side by Side */}
          <div className="information-name-fields">
            <InputField
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
              required
            />
            
            <InputField
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
              required
            />
          </div>

          {/* Date of Birth */}
          <InputField
            label="Date of Birth"
            type="date"
            placeholder="Select your date of birth"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            required
          />

          {/* Gender Dropdown */}
          <div className="information-select-group">
            <label className="information-select-label">
              Gender <span className="input-field-required">*</span>
            </label>
            <select
              className={`information-select ${errors.gender ? 'information-select-error' : ''}`}
              value={formData.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
              required
            >
              <option value="">Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && <span className="form-error">{errors.gender}</span>}
          </div>

          {/* Lifestyle Dropdown */}
          <div className="information-select-group">
            <label className="information-select-label">
              Lifestyle <span className="input-field-required">*</span>
            </label>
            <select
              className={`information-select ${errors.lifestyle ? 'information-select-error' : ''}`}
              value={formData.lifestyle}
              onChange={(e) => handleChange('lifestyle', e.target.value)}
              required
            >
              <option value="">Select your lifestyle</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Highly Active">Highly Active</option>
            </select>
            {errors.lifestyle && <span className="form-error">{errors.lifestyle}</span>}
          </div>

          {/* Continue Button */}
          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            className="information-btn"
          >
            Continue
          </Button>
        </form>
      </FormWrapper>
    </div>
  )
}

export default Information
