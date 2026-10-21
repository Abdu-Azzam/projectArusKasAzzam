import { ArrowLeft, Mail, Upload, UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Profile({ session, onBack, onLogout, onOpenEdit, isEditing = false }) {
  const userEmail = session?.user?.email || 'user@example.com'
  const safeName = session?.user?.user_metadata?.full_name || userEmail.split('@')[0]
  const [fullName, setFullName] = useState(safeName)
  const [avatarUrl, setAvatarUrl] = useState(session?.user?.user_metadata?.avatar_url || '')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFullName(session?.user?.user_metadata?.full_name || userEmail.split('@')[0])
    setAvatarUrl(session?.user?.user_metadata?.avatar_url || '')
  }, [session, userEmail])

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)
    setAvatarUrl(URL.createObjectURL(selectedFile))
  }

  const handleSaveProfile = async () => {
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      let finalAvatarUrl = avatarUrl

      if (file) {
        const filePath = `avatars/${session.user.id}-${Date.now()}-${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true })

        if (uploadError) {
          throw new Error(uploadError.message || 'Upload foto profil gagal.')
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
        finalAvatarUrl = data.publicUrl
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          avatar_url: finalAvatarUrl,
        },
      })

      if (updateError) {
        throw new Error(updateError.message || 'Gagal menyimpan profil.')
      }

      setAvatarUrl(finalAvatarUrl)
      setSuccess('Profil berhasil diperbarui.')
      setFile(null)
    } catch (saveError) {
      setError(saveError.message || 'Tidak bisa menyimpan profil.')
    } finally {
      setSaving(false)
    }
  }

  const initials = fullName.slice(0, 2).toUpperCase()

  if (isEditing) {
    return (
      <div className="auth-shell">
        <div className="profile-card edit-profile-card">
          <div className="profile-header">
            <button type="button" className="back-button" onClick={onBack}>
              <ArrowLeft size={16} /> Kembali
            </button>

            <div className="profile-avatar-large">
              {avatarUrl ? <img src={avatarUrl} alt={fullName} className="avatar-image" /> : initials}
            </div>
            <h1>Edit Profil</h1>
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Nama tampilan</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Masukkan nama Anda"
            />
          </div>

          <div className="form-group">
            <label htmlFor="avatarUpload">Foto profil</label>
            <label className="upload-box" htmlFor="avatarUpload">
              <Upload size={18} />
              <span>{file ? file.name : 'Pilih foto profil'}</span>
            </label>
            <input id="avatarUpload" type="file" accept="image/*" onChange={handleFileChange} hidden />
          </div>

          {error && <div className="auth-message error">{error}</div>}
          {success && <div className="auth-message success">{success}</div>}

          <button type="button" className="primary-button profile-logout" onClick={handleSaveProfile} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan profil'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <div className="profile-card">
        <div className="profile-header">
          <button type="button" className="back-button" onClick={onBack}>
            <ArrowLeft size={16} /> Kembali
          </button>

          <div className="profile-avatar-large">
            {avatarUrl ? <img src={avatarUrl} alt={fullName} className="avatar-image" /> : initials}
          </div>
          <h1>Profil User</h1>
        </div>

        <div className="profile-info">
          <div className="profile-row">
            <div className="profile-icon">
              <UserCircle size={18} />
            </div>
            <div>
              <small>Nama akun</small>
              <strong>{fullName}</strong>
            </div>
          </div>

          <div className="profile-row">
            <div className="profile-icon">
              <Mail size={18} />
            </div>
            <div>
              <small>Email</small>
              <strong>{userEmail}</strong>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" className="primary-button profile-logout" onClick={onOpenEdit}>
            Edit profil
          </button>
          <button type="button" className="secondary-button profile-logout" onClick={onLogout}>
            Keluar dari akun
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
