import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Daftar from './pages/Daftar'
import Profile from './pages/Profile'
import { supabase } from './lib/supabase'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('login')

  useEffect(() => {
    const initializeSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setLoading(false)
    }

    initializeSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setView(nextSession ? 'dashboard' : 'login')
    })

    return () => authListener.subscription.unsubscribe()
  }, [])

  const handleLogin = async ({ email, password }) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      setView('dashboard')
      return { ok: true }
    } catch (error) {
      return { error: error.message || 'Login gagal.' }
    }
  }

  const handleDaftar = async ({ email, password }) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return { error: error.message }
      setView('login')
      return { ok: true }
    } catch (error) {
      return { error: error.message || 'Pendaftaran gagal.' }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setView('login')
  }

  if (loading) {
    return (
      <div className="auth-shell">
        <div className="auth-card loading-card">Memuat...</div>
      </div>
    )
  }

  if (!session) {
    if (view === 'login') {
      return <Login onLogin={handleLogin} onGoToDaftar={() => setView('daftar')} />
    }

    return <Daftar onDaftar={handleDaftar} onGoToLogin={() => setView('login')} />
  }

  if (view === 'profile') {
    return (
      <Profile
        session={session}
        onBack={() => setView('dashboard')}
        onLogout={handleLogout}
        onOpenEdit={() => setView('editProfile')}
      />
    )
  }

  if (view === 'editProfile') {
    return (
      <Profile
        session={session}
        onBack={() => setView('profile')}
        onLogout={handleLogout}
        onOpenEdit={() => setView('editProfile')}
        isEditing
      />
    )
  }

  return (
    <Dashboard
      session={session}
      onLogout={handleLogout}
      onOpenProfile={() => setView('profile')}
    />
  )
}

export default App
