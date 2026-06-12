import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../../hooks/useLocalStorage'
import { updateProfile } from '../../lib/backendApi'
import FormWrapper from '../../components/FormWrapper/FormWrapper'
import Button from '../../components/Button/Button'
import ProgressBar from '../../components/ProgressBar/ProgressBar'
import './Concern.css'

/**
 * Concern Page Component
 * 
 * Collects user wellness concerns, health problem status,
 * and descriptions for personalized Ayurvedic recommendations.
 * 
 * Features:
 * - Concern options: Skin, Muscle and Joint, Gut Health
 * - Health Problem selection: Yes, No
 * - Description textarea with 50-word limit
 * - Form validation
 * - Saves data to localStorage
 * - Navigates to Result page on success
 */
function Concern() {
  const navigate = useNavigate()
  
  // Save concern data to localStorage
  const [concernData, setConcernData] = useLocalStorage('nyurveda_concerns', {
    selectedConcerns: [],
    hasHealthProblem: '',
    description: ''
  })

  // Form state management
  const [formData, setFormData] = useState({
    selectedConcerns: concernData.selectedConcerns || [],
    hasHealthProblem: concernData.hasHealthProblem || '',
    description: concernData.description || ''
  })

  // Error state for validation
  const [errors, setErrors] = useState({})

  // Concern options
  const concernOptions = [
    { id: 'skin', label: 'Skin', icon: '🧴', desc: 'Acne, dryness, aging, or other skin issues' },
    { id: 'muscle-joint', label: 'Muscle and Joint', icon: '💪', desc: 'Pain, stiffness, or mobility concerns' },
    { id: 'gut-health', label: 'Gut Health', icon: '🥗', desc: 'Digestion, bloating, or dietary issues' }
  ]

  /**
   * Toggle concern selection
   * Adds or removes concern from selected list
   */
  const toggleConcern = (concernId) => {
    setFormData(prev => {
      const currentSelected = prev.selectedConcerns || []
      if (currentSelected.includes(concernId)) {
        return { ...prev, selectedConcerns: currentSelected.filter(id => id !== concernId) }
      } else {
        return { ...prev, selectedConcerns: [...currentSelected, concernId] }
      }
    })
    // Clear error when user selects
    if (errors.selectedConcerns) {
      setErrors(prev => ({ ...prev, selectedConcerns: '' }))
    }
  }

  /**
   * Handle input field changes
   * Updates form data and clears errors
   */
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user types/selects
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  /**
   * Count words in description
   * Returns the number of words
   */
  const countWords = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  /**
   * Validate form fields
   * Checks if all required fields are filled correctly
   */
  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.selectedConcerns || formData.selectedConcerns.length === 0) {
      newErrors.selectedConcerns = 'Please select at least one concern'
    }
    
    if (!formData.hasHealthProblem) {
      newErrors.hasHealthProblem = 'Please indicate if you have any health problems'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please provide a description'
    } else if (countWords(formData.description) > 50) {
      newErrors.description = 'Description must be 50 words or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Loading state for API call
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle form submission
   * 1. Validates form
   * 2. Calls backend PUT /profile/{user_id} with concern data
   * 3. Saves to localStorage
   * 4. Navigates to Result page
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Get user_id from localStorage
      const userData = JSON.parse(localStorage.getItem('nyurveda_user') || '{}')
      const userId = userData.userId

      if (userId) {
        // Update profile via backend with concern data
        await updateProfile(userId, {
          concerns: JSON.stringify(formData.selectedConcerns),
          has_health_problem: formData.hasHealthProblem,
          concern_description: formData.description.trim(),
        })
      }

      // Save to localStorage
      setConcernData({
        selectedConcerns: formData.selectedConcerns,
        hasHealthProblem: formData.hasHealthProblem,
        description: formData.description.trim()
      })

      // Navigate to Result page
      navigate('/result')
    } catch (error) {
      console.error('Failed to update concerns:', error)
      // Still save locally and navigate even if backend fails
      setConcernData({
        selectedConcerns: formData.selectedConcerns,
        hasHealthProblem: formData.hasHealthProblem,
        description: formData.description.trim()
      })
      navigate('/result')
    } finally {
      setIsLoading(false)
    }
  }

  const wordCount = countWords(formData.description)

  return (
    <div className="concern-page">
      {/* Progress Bar */}
      <ProgressBar currentStep={3} totalSteps={4} />

      {/* Form Section */}
      <FormWrapper
        title="What Brings You Here?"
        subtitle="Select your wellness concerns and provide details for personalized recommendations"
      >
        <form className="concern-form" onSubmit={handleSubmit}>
          {/* Concern Options */}
          <div className="concern-section">
            <label className="concern-section-label">
              Select Concerns <span className="input-field-required">*</span>
            </label>
            <div className="concern-options">
              {concernOptions.map((concern) => (
                <button
                  key={concern.id}
                  type="button"
                  className={`concern-option ${formData.selectedConcerns.includes(concern.id) ? 'concern-option-selected' : ''}`}
                  onClick={() => toggleConcern(concern.id)}
                >
                  <span className="concern-option-icon">{concern.icon}</span>
                  <span className="concern-option-label">{concern.label}</span>
                  <span className="concern-option-desc">{concern.desc}</span>
                  {formData.selectedConcerns.includes(concern.id) && (
                    <span className="concern-check">✓</span>
                  )}
                </button>
              ))}
            </div>
            {errors.selectedConcerns && <span className="form-error">{errors.selectedConcerns}</span>}
          </div>

          {/* Health Problem Selection */}
          <div className="concern-section">
            <label className="concern-section-label">
              Do you have any health problems? <span className="input-field-required">*</span>
            </label>
            <div className="concern-health-options">
              <button
                type="button"
                className={`concern-health-option ${formData.hasHealthProblem === 'Yes' ? 'concern-health-option-selected' : ''}`}
                onClick={() => handleChange('hasHealthProblem', 'Yes')}
              >
                <span className="concern-health-icon">✓</span>
                <span className="concern-health-label">Yes</span>
              </button>
              <button
                type="button"
                className={`concern-health-option ${formData.hasHealthProblem === 'No' ? 'concern-health-option-selected' : ''}`}
                onClick={() => handleChange('hasHealthProblem', 'No')}
              >
                <span className="concern-health-icon">✗</span>
                <span className="concern-health-label">No</span>
              </button>
            </div>
            {errors.hasHealthProblem && <span className="form-error">{errors.hasHealthProblem}</span>}
          </div>

          {/* Description Textarea */}
          <div className="concern-section">
            <label className="concern-section-label">
              Describe your concerns <span className="input-field-required">*</span>
            </label>
            <textarea
              className={`concern-textarea ${errors.description ? 'concern-textarea-error' : ''}`}
              placeholder="Please describe your wellness concerns in detail (maximum 50 words)..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
            />
            <div className="concern-word-count">
              <span className={wordCount > 50 ? 'concern-word-count-error' : ''}>
                {wordCount}/50 words
              </span>
            </div>
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Proceed Button */}
          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            className="concern-btn"
          >
            Proceed
          </Button>
        </form>
      </FormWrapper>
    </div>
  )
}

export default Concern
