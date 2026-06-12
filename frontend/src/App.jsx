/**
 * NYURVEDA - Main App Component
 * 
 * This is the root component of the application.
 * It sets up the BrowserRouter and imports the route configuration.
 * 
 * BrowserRouter enables client-side routing, allowing users
 * to navigate between pages without full page reloads.
 */

import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes'
import './styles/variables.css'
import './styles/global.css'
import './App.css'

/**
 * App Component
 * 
 * Wraps the entire application with BrowserRouter for routing.
 * The actual route definitions are in routes.jsx for better organization.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
