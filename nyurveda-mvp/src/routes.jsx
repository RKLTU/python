/**
 * NYURVEDA - Route Configuration
 * 
 * This file defines all the routes for the application.
 * React Router DOM allows us to navigate between pages
 * without refreshing the browser.
 * 
 * Route Flow:
 * / (Login) → /information → /concern → /result
 */

import { Routes, Route } from 'react-router-dom'

// Import all page components
import Login from './pages/Login/Login'
import Information from './pages/Information/Information'
import Concern from './pages/Concern/Concern'
import Result from './pages/Result/Result'

/**
 * AppRoutes Component
 * 
 * This component contains all the route definitions.
 * Each route maps a URL path to a specific page component.
 * 
 * Routes:
 * - "/" → Login page (starting point)
 * - "/information" → User information collection
 * - "/concern" → Wellness concern selection
 * - "/result" → Personalized recommendations
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Home/Login page - Entry point of the app */}
      <Route path="/" element={<Login />} />
      
      {/* Information page - Collects user details (age, gender, lifestyle) */}
      <Route path="/information" element={<Information />} />
      
      {/* Concern page - User selects wellness concerns */}
      <Route path="/concern" element={<Concern />} />
      
      {/* Result page - Shows personalized Ayurvedic recommendations */}
      <Route path="/result" element={<Result />} />
    </Routes>
  )
}

export default AppRoutes