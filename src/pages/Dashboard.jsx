import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Plus,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Navbar from '../components/Navbar'
import SummaryCard from '../components/SummaryCard'
import TransactionForm from '../components/TrancsactionForm'
import TransactionList from '../components/TransactionList'
import { supabase } from '../lib/supabase'
import formatCurrency from '../utils/formatCurrency'

const initialTransactions = [
  { id: 1, title: 'Gaji', amount: 4800000, type: 'income', category: 'Gaji', date: '2026-10-01' },
  { id: 2, title: 'Transport', amount: 165000, type: 'expense', category: 'Transport', date: '2026-10-02' },
  { id: 3, title: 'Proyek Freelance', amount: 900000, type: 'income', category: 'Lainnya', date: '2026-10-05' },
  { id: 4, title: 'Makan', amount: 420000, type: 'expense', category: 'Makan', date: '2026-10-08' },
  { id: 5, title: 'Transport', amount: 180000, type: 'expense', category: 'Transport', date: '2026-10-11' },
  { id: 6, title: 'Keuntungan Investasi', amount: 320000, type: 'income', category: 'Lainnya', date: '2026-10-12' },
]

function Dashboard({ session, onLogout, onOpenProfile }) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const monthlyFlowData = useMemo(() => {
    const monthMap = new Map()

    transactions.forEach((transaction) => {
      const date = new Date(`${transaction.date}T00:00:00`)
      const key = `${date.getFullYear()}-${date.getMonth()}`

      if (!monthMap.has(key)) {
        monthMap.set(key, {
          sortKey: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
          month: new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date),
          income: 0,
          expense: 0,
        })
      }

      const currentMonth = monthMap.get(key)
      const amount = Number(transaction.amount) || 0

      if (transaction.type === 'income') {
        currentMonth.income += amount
      } else {
        currentMonth.expense += amount
      }
    })

    return [...monthMap.values()].sort((a, b) => a.sortKey - b.sortKey)
  }, [transactions])

  const categoryBreakdown = useMemo(() => {
    const totalExpense = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    if (totalExpense === 0) {
      return [
        { name: 'Transport', value: 0 },
        { name: 'Makan', value: 0 },
        { name: 'Gaji', value: 0 },
        { name: 'Lainnya', value: 0 },
      ]
    }

    const grouped = transactions
      .filter((item) => item.type === 'expense')
      .reduce((result, item) => {
        const category = item.category || 'Lainnya'
        result[category] = (result[category] || 0) + Number(item.amount || 0)
        return result
      }, {})

    const categories = Object.entries(grouped)
      .map(([name, total]) => ({
        name,
        value: Math.round((total / totalExpense) * 100),
        total,
      }))
      .sort((a, b) => b.total - a.total)

    return categories.length > 0 ? categories : [
      { name: 'Transport', value: 0 },
      { name: 'Makan', value: 0 },
      { name: 'Gaji', value: 0 },
      { name: 'Lainnya', value: 0 },
    ]
  }, [transactions])

  const budgetHealth = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const expense = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    if (income === 0) return 0

    const ratio = (expense / income) * 100
    return Math.min(100, Math.max(0, Math.round(ratio)))
  }, [transactions])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchTransactions = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: false })

      if (!error && data) {
        setTransactions(data)
      }
    }

    fetchTransactions()

    const channel = supabase
      .channel(`transactions_${session.user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${session.user.id}` },
        () => {
          fetchTransactions()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  const summary = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'income')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const expense = transactions
      .filter((item) => item.type === 'expense')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    const balance = income - expense
    const savings = balance * 0.38

    return {
      income,
      expense,
      balance,
      savings,
    }
  }, [transactions])

  const handleSaveTransaction = async (transaction) => {
    try {
      const payload = {
        user_id: session.user.id,
        title: transaction.title,
        amount: Number(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
      }

      if (transaction.id) {
        const { data, error } = await supabase
          .from('transactions')
          .update(payload)
          .eq('id', transaction.id)
          .select()

        if (error) {
          console.error('Update transaction error:', error)
          throw new Error(error.message || 'Gagal memperbarui transaksi.')
        }

        if (data && data[0]) {
          setTransactions((current) =>
            current.map((item) => (item.id === transaction.id ? data[0] : item)),
          )
        }

        setEditingTransaction(null)
        return true
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert([payload])
        .select()

      if (error) {
        console.error('Insert transaction error:', error)
        throw new Error(error.message || 'Gagal menyimpan transaksi ke Supabase.')
      }

      if (data && data[0]) {
        setTransactions((current) => [data[0], ...current])
      }

      return true
    } catch (error) {
      console.error('Transaction submit failed:', error)
      return false
    }
  }

  const handleDeleteTransaction = async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (!error) {
      setTransactions((current) => current.filter((item) => item.id !== id))
    }
  }

  return (
    <div className="app-shell">
      <div className="dashboard">
        <Navbar
          userEmail={session?.user?.email}
          userAvatar={session?.user?.user_metadata?.avatar_url}
          onOpenProfile={onOpenProfile}
          onLogout={onLogout}
        />

        <section className="hero-panel">
          <div className="hero-copy">
            <p className="pill">Ikhtisar bulanan</p>
            <h2>Dasbor arus kas</h2>
            <p>
              Pantau setiap rupiah, sesuaikan anggaran, dan jaga momentum pertumbuhan finansial Anda.
            </p>
          </div>

          <div className="hero-summary">
            <div className="summary-meter">
              <span>Kesehatan anggaran</span>
              <strong>{100 - budgetHealth}%</strong>
            </div>
            <div className="progress-track">
              <span className="progress-bar" style={{ width: `${100 - budgetHealth}%` }} />
            </div>
            <div className="summary-meter" style={{ marginTop: '18px' }}>
              <span>Siap untuk tujuan</span>
              <strong>{formatCurrency(summary.savings)}</strong>
            </div>
          </div>
        </section>

        <section className="summary-grid">
          <SummaryCard
            icon={ArrowUpCircle}
            label="Pemasukan"
            value={formatCurrency(summary.income)}
            change="+14,2%"
            tone="income"
          />
          <SummaryCard
            icon={ArrowDownCircle}
            label="Pengeluaran"
            value={formatCurrency(summary.expense)}
            change="-4,8%"
            tone="expense"
          />
          <SummaryCard
            icon={Wallet}
            label="Saldo bersih"
            value={formatCurrency(summary.balance)}
            change="+8,5%"
            tone="balance"
          />
          <SummaryCard
            icon={PiggyBank}
            label="Tabungan"
            value={formatCurrency(summary.savings)}
            change="+12,1%"
            tone="savings"
          />
        </section>

        <section className="content-grid">
          <div>
            <div className="chart-card">
              <div className="section-header">
                <h3>Arus kas</h3>
                <span className="pill">Tahun ini</span>
              </div>

              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyFlowData}>
                    <defs>
                      <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.04} />
                      </linearGradient>
                      <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeFill)" strokeWidth={3} />
                    <Area type="monotone" dataKey="expense" stroke="#3b82f6" fill="url(#expenseFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="list-card">
              <div className="section-header">
                <h3>Transaksi terakhir</h3>
                <span className="pill">Diperbarui hari ini</span>
              </div>

              <TransactionList
                transactions={transactions.slice(0, 5)}
                onEdit={(transaction) => setEditingTransaction(transaction)}
                onDelete={handleDeleteTransaction}
              />
            </div>
          </div>

          <div>
            <div className="form-card">
              <div className="section-header">
                <h3>{editingTransaction ? 'Edit transaksi' : 'Tambah transaksi'}</h3>
                <span className="pill">{editingTransaction ? 'Perbarui' : 'Input cepat'}</span>
              </div>
              <TransactionForm
                onSaveTransaction={handleSaveTransaction}
                initialData={editingTransaction}
                onCancelEdit={() => setEditingTransaction(null)}
              />
            </div>

            <div className="chart-card" style={{ marginTop: '22px' }}>
              <div className="section-header">
                <h3>Pengeluaran</h3>
                <span className="pill">Per kategori</span>
              </div>

              <div className="chart-wrap" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fill: '#334155' }} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        <section className="spending-grid">
          {categoryBreakdown.map((item) => (
            <div key={item.name} className="category-card">
              <div className="category-top">
                <span>{item.name}</span>
                <span>{item.value}%</span>
              </div>
              <div className="category-bar">
                <span style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
