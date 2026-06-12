import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../../hooks/useLocalStorage'
import { signup, login, updateProfile } from '../../lib/backendApi'
import FormWrapper from '../../components/FormWrapper/FormWrapper'
import InputField from '../../components/InputField/InputField'
import Button from '../../components/Button/Button'
import './Login.css'

/**
 * Login Page Component
 * 
 * This is the entry point of the NYURVEDA wellness application.
 * Users enter their details to begin their personalized wellness journey.
 * 
 * Features:
 * - First Name, Last Name, Email, and Password fields
 * - Form validation for empty fields
 * - Saves user data to localStorage
 * - Navigates to Information page on successful login
 * - Uses reusable components for consistent UI
 */
function Login() {
  const navigate = useNavigate()
  
  // Save user data to localStorage
  const [user, setUser] = useLocalStorage('nyurveda_user', {
    firstName: '',
    lastName: '',
    email: '',
    isLoggedIn: false
  })

  // Form state management
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    password: ''
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!formData.email.includes('@')) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Loading state for API call
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Handle form submission
   * 1. Validates form
   * 2. Calls backend POST /auth/signup (creates Supabase Auth user + trigger creates profile)
   * 3. Calls backend PUT /profile/{user_id} (saves firstName, lastName)
   * 4. Saves user_id to localStorage
   * 5. Navigates to Information page
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      let userId = null

      // Step 1: Try to LOG IN first (handles existing users immediately)
      try {
        const loginResult = await login(formData.email.trim(), formData.password)
        userId = loginResult.user.id
      } catch (loginError) {
        // Login failed — user might be new, so try signup
        try {
          const signupResult = await signup(formData.email.trim(), formData.password)
          userId = signupResult.user_id
        } catch (signupError) {
          // Both failed — show the most helpful error
          const errorMsg = signupError.message || ''
          if (errorMsg.includes('already') || errorMsg.includes('registered') || errorMsg.includes('exists')) {
            // User exists but login failed — likely wrong password or email not confirmed
            throw new Error('Account exists but login failed. Please check your password, or disable email confirmation in Supabase dashboard.')
          }
          throw signupError
        }
      }

      if (!userId) {
        throw new Error('Could not create or find your account. Please try again.')
      }

      // Step 2: Update profile with first and last name
      try {
        await updateProfile(userId, {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
        })
      } catch (profileError) {
        // Profile update failed — log but don't block navigation
        console.warn('Profile update failed:', profileError.message)
      }

      // Step 3: Save user data to localStorage (including user_id)
      setUser({
        userId: userId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        isLoggedIn: true
      })

      // Step 4: Navigate to Information page
      navigate('/information')
    } catch (error) {
      // Show error to user
      setErrors({ general: error.message || 'Signup failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Hero Section with Logo */}
      <div className="login-hero">
        <div className="login-logo">🌿</div>
        <h1 className="login-title">NYURVEDA</h1>
        <p className="login-subtitle">Nurture with Nature</p>
      </div>

      {/* Login Form using FormWrapper */}
      <FormWrapper
        title="Welcome to Your Wellness Journey"
        subtitle="Create your account to discover personalized Ayurvedic recommendations"
      >
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Show general errors (e.g. from API) */}
          {errors.general && (
            <div style={{ color: '#e74c3c', background: '#fdecea', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
              {errors.general}
            </div>
          )}
          {/* Name Fields - Side by Side */}
          <div className="login-name-fields">
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

          {/* Email Field */}
          <InputField
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
          />

          {/* Password Field */}
          <InputField
            label="Password"
            type="password"
            placeholder="Enter your password (min 6 characters)"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            required
          />

          {/* Login Button */}
          <Button 
            type="submit" 
            variant="primary" 
            size="large" 
            className="login-btn"
          >
            Begin Your Journey
          </Button>
        </form>

        {/* Features Section */}
        <div className="login-features">
          <div className="login-feature">
            <span className="login-feature-icon">🧘</span>
            <span>Personalized Assessment</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">🌱</span>
            <span>Natural Remedies</span>
          </div>
          <div className="login-feature">
            <span className="login-feature-icon">💚</span>
            <span>Holistic Wellness</span>
          </div>
        </div>
      </FormWrapper>
    </div>
  )
}

export default Login
