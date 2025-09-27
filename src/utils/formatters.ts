export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export const formatPercentage = (value: number): string => {
  return `${Math.round(value * 100)}%`
}

export const formatRiskLevel = (level: string): { color: string, label: string } => {
  switch (level.toLowerCase()) {
    case 'critical':
      return { color: 'text-red-600', label: 'CRITICAL' }
    case 'high':
      return { color: 'text-orange-600', label: 'HIGH' }
    case 'medium':
      return { color: 'text-yellow-600', label: 'MEDIUM' }
    case 'low':
      return { color: 'text-green-600', label: 'LOW' }
    default:
      return { color: 'text-gray-600', label: 'UNKNOWN' }
  }
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}