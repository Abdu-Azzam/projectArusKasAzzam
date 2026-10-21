import { useState } from 'react'

function Login({ onLogin, onGoToDaftar }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const result = await onLogin({ email, password })

    if (result?.error) {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">A</div>
          <h1>Masuk ke Aruskas</h1>
          <p>Kelola pemasukan dan pengeluaranmu secara pribadi.</p>
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
              placeholder="Masukkan password"
              minLength={6}
              required
            />
          </label>

          {error && <div className="auth-message error">{error}</div>}

          <button type="submit" className="primary-button auth-button" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>Belum punya akun?</span>
          <button type="button" onClick={onGoToDaftar}>Daftar sekarang</button>
        </div>
      </div>
    </div>
  )
}

export default Login
