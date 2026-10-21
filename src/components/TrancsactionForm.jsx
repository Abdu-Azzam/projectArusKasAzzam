import { useEffect, useState } from 'react'

const defaultForm = {
  title: '',
  amount: '',
  type: 'expense',
  category: 'Transport',
  date: new Date().toISOString().slice(0, 10),
}

const categories = ['Transport', 'Gaji', 'Makan', 'Lainnya']

function TransactionForm({ onSaveTransaction, initialData = null, onCancelEdit }) {
  const [form, setForm] = useState(defaultForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        amount: initialData.amount ?? '',
        type: initialData.type || 'expense',
        category: initialData.category || 'Transport',
        date: initialData.date || new Date().toISOString().slice(0, 10),
      })
    } else {
      setForm({ ...defaultForm, date: new Date().toISOString().slice(0, 10) })
    }
  }, [initialData])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.title.trim() || !form.amount) {
      setError('Judul dan jumlah wajib diisi.')
      return
    }

    const amount = Number(form.amount)

    if (Number.isNaN(amount) || amount <= 0) {
      setError('Jumlah harus lebih dari 0.')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const payload = {
        title: form.title.trim(),
        amount,
        type: form.type,
        category: form.category,
        date: form.date,
      }

      const success = await onSaveTransaction(initialData ? { ...payload, id: initialData.id } : payload)

      if (success !== false) {
        setForm({ ...defaultForm, date: new Date().toISOString().slice(0, 10) })
        if (onCancelEdit) onCancelEdit()
      }
    } catch (submitError) {
      setError(submitError.message || 'Gagal menyimpan transaksi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <div className="field-group">
        <label htmlFor="title">Judul</label>
        <input
          id="title"
          name="title"
          type="text"
          value={form.title}
          onChange={handleChange}
          placeholder="mis. Pembayaran freelance"
        />
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="amount">Jumlah</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>

        <div className="field-group">
          <label htmlFor="type">Tipe</label>
          <select id="type" name="type" value={form.type} onChange={handleChange}>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field-group">
          <label htmlFor="category">Kategori</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="date">Tanggal</label>
          <input id="date" name="date" type="date" value={form.date} onChange={handleChange} />
        </div>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', fontSize: '0.8rem', fontWeight: 600 }}>{error}</div>
      )}

      <div className="form-actions">
        <button type="submit" className="primary-button form-submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : initialData ? 'Update transaksi' : 'Simpan transaksi'}
        </button>

        {initialData && (
          <button type="button" className="secondary-button form-submit" onClick={onCancelEdit}>
            Batal
          </button>
        )}
      </div>
    </form>
  )
}

export default TransactionForm
