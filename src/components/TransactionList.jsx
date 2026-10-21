import { ArrowDownCircle, ArrowUpCircle, Pencil, Trash2 } from 'lucide-react'
import formatCurrency from '../utils/formatCurrency'
import formatDate from '../utils/formatDate'

function TransactionList({ transactions, onEdit, onDelete }) {
  return (
    <ul className="transaction-list">
      {transactions.map((transaction) => (
        <li key={transaction.id} className="transaction-item">
          <div className={`transaction-icon ${transaction.type}`}>
            {transaction.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
          </div>

          <div className="transaction-details">
            <h4>{transaction.title}</h4>
            <div className="transaction-meta">
              <span>{transaction.category}</span>
              <span>•</span>
              <span>{formatDate(transaction.date)}</span>
            </div>
          </div>

          <div className="transaction-actions">
            <div className={`transaction-amount ${transaction.type}`}>
              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
            </div>

            <div className="transaction-buttons">
              <button
                type="button"
                className="mini-button edit-button"
                onClick={() => onEdit(transaction)}
                aria-label={`Edit ${transaction.title}`}
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                className="mini-button delete-button"
                onClick={() => onDelete(transaction.id)}
                aria-label={`Delete ${transaction.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default TransactionList
