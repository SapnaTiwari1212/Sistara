import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Mascot from '../brand/Mascot'

/** Soft loading + "please log in" gate for authenticated routes. */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-[70vh] place-items-center px-5">
        <div className="flex flex-col items-center gap-4">
          <Mascot size={110} />
          <p className="font-display text-lg font-bold text-ink-soft">Loading your orders…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

/** Signed-in users skip the login/signup screens. */
export const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default ProtectedRoute
