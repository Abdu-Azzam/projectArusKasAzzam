import { useState } from 'react'

function AuthForm({ onSubmit, loading, mode, setMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    const result = await onSubmit({ email, password })

    if (result?.error) {
      setMessage(result.error)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">A</div>
          <h1>{mode === 'login' ? 'Masuk ke Aruskas' : 'Buat akun Aruskas'}</h1>
          <p>
            {mode === 'login'
              ? 'Kelola pemasukan dan pengeluaranmu secara pribadi.'
              : 'Daftar untuk memisahkan data tiap pengguna.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimal 6 karakter"
              minLength={6}
              required
            />
          </label>

          {message && <div className="auth-message error">{message}</div>}

          <button type="submit" className="primary-button auth-button" disabled={loading}>
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}</span>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Daftar sekarang' : 'Masuk'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm
