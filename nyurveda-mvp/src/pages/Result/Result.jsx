import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../../hooks/useLocalStorage'
import { getProfile } from '../../lib/backendApi'
import FormWrapper from '../../components/FormWrapper/FormWrapper'
import Button from '../../components/Button/Button'
import ProgressBar from '../../components/ProgressBar/ProgressBar'
import './Result.css'

/**
 * Result Page Component
 * 
 * Displays personalized wellness outcomes based on user's choices.
 * Shows different messages based on health problem status and selected option.
 * 
 * Logic:
 * 1. Health Problem = YES + Auto Remedy → Direct to Live Consultation
 * 2. Health Problem = NO + Auto Remedy → Email Remedy
 * 3. Live Consultation selected → Email Consultation Details
 */
function Result() {
  const navigate = useNavigate()
  
  // Retrieve data from localStorage
  const [user] = useLocalStorage('nyurveda_user', { 
    firstName: '', 
    lastName: '', 
    email: '',
    isLoggedIn: false 
  })
  
  const [concernData] = useLocalStorage('nyurveda_concerns', {
    selectedConcerns: [],
    hasHealthProblem: '',
    description: ''
  })

  // State for selected option and message display
  const [selectedOption, setSelectedOption] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [backendProfile, setBackendProfile] = useState(null)

  // Fetch profile from backend on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('nyurveda_user') || '{}')
        if (userData.userId) {
          const profile = await getProfile(userData.userId)
          setBackendProfile(profile)
        }
      } catch (error) {
        console.error('Failed to fetch profile from backend:', error)
      }
    }
    fetchProfile()
  }, [])

  /**
   * Handle Auto Remedy button click
   * Shows different message based on health problem status
   */
  const handleAutoRemedy = () => {
    setSelectedOption('auto-remedy')
    setShowMessage(true)
  }

  /**
   * Handle Live Consultation button click
   * Shows consultation message
   */
  const handleLiveConsultation = () => {
    setSelectedOption('live-consultation')
    setShowMessage(true)
  }

  /**
   * Get the appropriate message based on selections
   */
  const getMessage = () => {
    if (selectedOption === 'auto-remedy') {
      if (concernData.hasHealthProblem === 'Yes') {
        return {
          type: 'consultation-redirect',
          title: 'Health Concern Detected',
          message: 'Sorry, due to your health reasons we are directing you to the Live Consultation. Details for the consultation will be sent on your email. Thank You.',
          icon: '🩺'
        }
      } else {
        return {
          type: 'remedy-email',
          title: 'Remedy On Its Way!',
          message: 'Remedy for your concern will be emailed to your given email address. Thank You.',
          icon: '📧'
        }
      }
    } else if (selectedOption === 'live-consultation') {
      return {
        type: 'consultation-scheduled',
        title: 'Consultation Scheduled',
        message: 'Details for the consultation will be sent on your email. Thank You.',
        icon: '✅'
      }
    }
    return null
  }

  const messageData = getMessage()

  return (
    <div className="result-page">
      {/* Progress Bar */}
      <ProgressBar currentStep={4} totalSteps={4} />

      {/* Form Section */}
      <FormWrapper
        title="Your Wellness Journey"
        subtitle={`Hello ${user.firstName || 'there'}! Choose how you'd like to proceed with your wellness recommendations.`}
      >
          {/* User Info Summary — uses backend data if available, falls back to localStorage */}
          <div className="result-user-summary">
            <div className="result-user-info">
              <span className="result-user-label">Name:</span>
              <span className="result-user-value">
                {backendProfile?.first_name || user.firstName} {backendProfile?.last_name || user.lastName}
              </span>
            </div>
            <div className="result-user-info">
              <span className="result-user-label">Email:</span>
              <span className="result-user-value">{backendProfile?.email || user.email}</span>
            </div>
            {backendProfile?.gender && (
              <div className="result-user-info">
                <span className="result-user-label">Gender:</span>
                <span className="result-user-value">{backendProfile.gender}</span>
              </div>
            )}
            {backendProfile?.lifestyle && (
              <div className="result-user-info">
                <span className="result-user-label">Lifestyle:</span>
                <span className="result-user-value">{backendProfile.lifestyle}</span>
              </div>
            )}
            <div className="result-user-info">
              <span className="result-user-label">Health Problems:</span>
              <span className="result-user-value">{backendProfile?.has_health_problem || concernData.hasHealthProblem || 'Not specified'}</span>
            </div>
          {concernData.selectedConcerns && concernData.selectedConcerns.length > 0 && (
            <div className="result-user-info">
              <span className="result-user-label">Concerns:</span>
              <span className="result-user-value">{concernData.selectedConcerns.join(', ')}</span>
            </div>
          )}
          {concernData.description && (
            <div className="result-user-info">
              <span className="result-user-label">Description:</span>
              <span className="result-user-value">{concernData.description}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!showMessage && (
          <div className="result-actions">
            <Button
              onClick={handleAutoRemedy}
              variant="primary"
              size="large"
              className="result-action-btn"
            >
              🌿 Auto Remedy
            </Button>
            <Button
              onClick={handleLiveConsultation}
              variant="secondary"
              size="large"
              className="result-action-btn"
            >
              👨‍⚕️ Live Consultation
            </Button>
          </div>
        )}

        {/* Dynamic Message Display */}
        {showMessage && messageData && (
          <div className={`result-message result-message-${messageData.type}`}>
            <div className="result-message-icon">{messageData.icon}</div>
            <h3 className="result-message-title">{messageData.title}</h3>
            <p className="result-message-text">{messageData.message}</p>
            <Button
              onClick={() => {
                setShowMessage(false)
                setSelectedOption('')
              }}
              variant="outline"
              size="medium"
              className="result-back-btn"
            >
              Choose Different Option
            </Button>
          </div>
        )}

        {/* Start Over Button */}
        <div className="result-footer">
          <Button
            onClick={() => {
              localStorage.removeItem('nyurveda_user')
              localStorage.removeItem('nyurveda_info')
              localStorage.removeItem('nyurveda_concerns')
              navigate('/')
            }}
            variant="outline"
            size="medium"
          >
            Start New Assessment
          </Button>
        </div>
      </FormWrapper>
    </div>
  )
}

export default Result
