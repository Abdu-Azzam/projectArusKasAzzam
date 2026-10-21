import { LogOut, Wallet } from 'lucide-react'

function Navbar({ userEmail, userAvatar, onOpenProfile, onLogout }) {
  const displayName = userEmail ? userEmail.split('@')[0] : 'User'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark">
          <Wallet size={20} />
        </div>
        <h1>CashFlow</h1>
      </div>

      <div className="nav-actions">
        <button type="button" className="profile-pill" onClick={onOpenProfile}>
          {userAvatar ? (
            <img src={userAvatar} alt={displayName} className="profile-avatar image-avatar" />
          ) : (
            <span className="profile-avatar">{initials}</span>
          )}
          <span>{displayName}</span>
        </button>

        <button type="button" className="logout-chip" onClick={onLogout}>
          <LogOut size={16} />
          Keluar
        </button>
      </div>
    </header>
  )
}

export default Navbar
