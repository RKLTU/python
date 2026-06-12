import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useLocalStorage from '../../hooks/useLocalStorage'
import { signup, updateProfile } from '../../lib/backendApi'
import FormWrapper from '../../components/FormWrapper/FormWrapper'
import InputField from '../../components/InputField/InputField'
import Button from '../../components/Button/Button'
import './Login.css'

function Login() {
  const navigate = useNavigate()

  const [user, setUser] = useLocalStorage('nyurveda_user', {
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    accessToken: '',
    refreshToken: '',
    isLoggedIn: false,
  })

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }))
    }

    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: '',
      }))
    }
  }

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const signupResult = await signup(
        formData.email.trim(),
        formData.password
      )

      const userId = signupResult.user_id
      const accessToken = signupResult.access_token
      const refreshToken = signupResult.refresh_token

      if (!userId) {
        throw new Error('Signup failed. User ID was not returned.')
      }

      if (!accessToken) {
        throw new Error(
          signupResult.message ||
            'Account created. Please confirm your email, then log in.'
        )
      }

      setUser({
        userId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        accessToken,
        refreshToken,
        isLoggedIn: true,
      })

      await updateProfile(
        userId,
        {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
        },
        accessToken
      )

      navigate('/information')
    } catch (error) {
      setErrors({
        general: error.message || 'Signup failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="login-logo">🌿</div>
        <h1 className="login-title">NYURVEDA</h1>
        <p className="login-subtitle">Nurture with Nature</p>
      </div>

      <FormWrapper
        title="Welcome to Your Wellness Journey"
        subtitle="Create your account to discover personalized Ayurvedic recommendations"
      >
        <form className="login-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div
              style={{
                color: '#e74c3c',
                background: '#fdecea',
                padding: '10px',
                borderRadius: '8px',
                