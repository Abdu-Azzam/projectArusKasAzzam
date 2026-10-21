import { useState } from 'react'

function Daftar({ onDaftar, onGoToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const result = await onDaftar({ email, password })

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess('Akun berhasil dibuat. Silakan masuk.')
      setEmail('')
      setPassword('')
    }

    setLoading(false)
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">A</div>
          <h1>Buat Akun Aruskas</h1>
          <p>Daftar untuk memisahkan data keuangan tiap pengguna.</p>
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

          {error && <div className="auth-message error">{error}</div>}
          {success && <div className="auth-message success">{success}</div>}

          <button type="submit" className="primary-button auth-button" disabled={loading}>
            {loading ? 'Memproses...' : 'Daftar'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>Sudah punya akun?</span>
          <button type="button" onClick={onGoToLogin}>Masuk</button>
        </div>
      </div>
    </div>
  )
}

export default Daftar
