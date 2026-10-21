const formatDate = (value) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))

export default formatDate
