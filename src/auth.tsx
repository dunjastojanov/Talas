import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useParams } from 'react-router'
import { AuthContext, useAuth, type AuthContextValue } from './auth-context'
import { supabase } from './lib/supabase'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthContextValue['session']>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error ? error.message : null
      },
      signOut: async () => {
        await supabase.auth.signOut()
      },
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function RequireAuth() {
  const { loading, session } = useAuth()
  const { lang } = useParams()

  if (loading) return null
  if (!session) return <Navigate to={`/${lang ?? 'en'}/admin/login`} replace />
  return <Outlet />
}
