function SummaryCard({ icon: Icon, label, value, change, tone = 'income' }) {
  return (
    <article className={`summary-card ${tone}`}>
      <div>
        <div className="summary-label">{label}</div>
        <div className="summary-value">{value}</div>
        <div className={`summary-change ${change.startsWith('-') ? 'negative' : 'positive'}`}>
          {change}
        </div>
      </div>

      <div className="icon-wrap">
        <Icon size={22} />
      </div>
    </article>
  )
}

export default SummaryCard
