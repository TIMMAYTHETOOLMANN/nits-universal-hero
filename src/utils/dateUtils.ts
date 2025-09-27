export const formatTimestamp = (): string => {
  return new Date().toISOString()
}

export const formatDisplayTime = (): string => {
  return new Date().toLocaleTimeString()
}

export const formatAnalysisTime = (startTime: Date): string => {
  const endTime = new Date()
  const diffMs = endTime.getTime() - startTime.getTime()
  const diffSeconds = Math.round(diffMs / 1000)
  
  if (diffSeconds < 60) {
    return `${diffSeconds}s`
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60)
    const seconds = diffSeconds % 60
    return `${minutes}m ${seconds}s`
  } else {
    const hours = Math.floor(diffSeconds / 3600)
    const minutes = Math.floor((diffSeconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }
}

export const generateTimestampId = (): string => {
  return `NITS-${Date.now()}`
}