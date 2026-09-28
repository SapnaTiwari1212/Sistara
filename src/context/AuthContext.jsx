import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authService
      .getSession()
      .then((s) => {
        if (active) setSession(s)
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const signUp = useCallback(async (payload) => {
    const next = await authService.signUp(payload)
    setSession(next)
    return next
  }, [])

  const signIn = useCallback(async (payload) => {
    const next = await authService.signIn(payload)
    setSession(next)
    return next
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const next = await authService.signInWithGoogle()
    // A real OAuth redirect leaves the page and never resolves to a session.
    if (next) setSession(next)
    return next
  }, [])

  const requestPasswordReset = useCallback(async (email) => {
    return authService.requestPasswordReset(email)
  }, [])

  const resetPassword = useCallback(async (payload) => {
    return authService.resetPassword(payload)
  }, [])

  const signOut = useCallback(async () => {
    await authService.signOut()
    setSession(null)
  }, [])

  const updateProfile = useCallback(async (patch) => {
    const next = await authService.updateProfile(patch)
    setSession(next)
    return next
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      requestPasswordReset,
      resetPassword,
      isDemo: authService.isDemo,
    }),
    [
      session,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateProfile,
      requestPasswordReset,
      resetPassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
