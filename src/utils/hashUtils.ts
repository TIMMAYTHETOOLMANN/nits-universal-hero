import { FileItem } from '../types/common'

export const generateStableHash = (files: FileItem[]): string => {
  const hashString = files.map(f => `${f.name}_${f.size}`).sort().join('|')
  // Simple but deterministic hash function
  let hash = 0
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36)
}

export const generateFileHash = (file: FileItem, index: number): string => {
  const hashString = `${file.name.toLowerCase()}_${file.size}_${index}`
  let hash = 0
  for (let i = 0; i < hashString.length; i++) {
    const char = hashString.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

export const generateUniqueId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}