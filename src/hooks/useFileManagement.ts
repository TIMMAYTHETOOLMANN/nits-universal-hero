import { useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { FileItem } from '../types/common'
import { validateFiles } from '../utils/fileValidation'

export interface UseFileManagementReturn {
  secFiles: FileItem[]
  glamourFiles: FileItem[]
  handleFileUpload: (files: FileList | null, type: 'sec' | 'glamour') => { 
    success: boolean
    message: string
    errors?: string[] 
  }
  clearFiles: (type: 'sec' | 'glamour' | 'all') => void
  removeFile: (type: 'sec' | 'glamour', index: number) => void
  getTotalFileCount: () => number
  getTotalFileSize: () => number
}

export const useFileManagement = (): UseFileManagementReturn => {
  const [secFiles, setSecFiles] = useKV<FileItem[]>('sec-files', [])
  const [glamourFiles, setGlamourFiles] = useKV<FileItem[]>('glamour-files', [])

  const convertFileToFileItem = (file: File): FileItem => ({
    name: file.name,
    size: file.size,
    type: file.type
  })

  const handleFileUpload = useCallback((files: FileList | null, type: 'sec' | 'glamour') => {
    if (!files || files.length === 0) {
      return { success: false, message: 'No files selected' }
    }
    
    const { validFiles, errors } = validateFiles(files)
    
    if (validFiles.length > 0) {
      const fileItems = validFiles.map(convertFileToFileItem)
      
      if (type === 'sec') {
        setSecFiles(prev => [...(prev || []), ...fileItems])
      } else {
        setGlamourFiles(prev => [...(prev || []), ...fileItems])
      }
    }

    const successMessage = validFiles.length === 1 
      ? `Added 1 file to ${type === 'sec' ? 'SEC' : 'Glamour'} zone`
      : `Added ${validFiles.length} files to ${type === 'sec' ? 'SEC' : 'Glamour'} zone`

    const errorMessage = errors.length > 0 
      ? `, ${errors.length} files failed validation`
      : ''

    return {
      success: validFiles.length > 0,
      message: successMessage + errorMessage,
      errors: errors.length > 0 ? errors : undefined
    }
  }, [setSecFiles, setGlamourFiles])

  const clearFiles = useCallback((type: 'sec' | 'glamour' | 'all') => {
    if (type === 'sec' || type === 'all') {
      setSecFiles([])
    }
    if (type === 'glamour' || type === 'all') {
      setGlamourFiles([])
    }
  }, [setSecFiles, setGlamourFiles])

  const removeFile = useCallback((type: 'sec' | 'glamour', index: number) => {
    if (type === 'sec') {
      setSecFiles(prev => (prev || []).filter((_, i) => i !== index))
    } else {
      setGlamourFiles(prev => (prev || []).filter((_, i) => i !== index))
    }
  }, [setSecFiles, setGlamourFiles])

  const getTotalFileCount = useCallback(() => {
    return (secFiles?.length || 0) + (glamourFiles?.length || 0)
  }, [secFiles, glamourFiles])

  const getTotalFileSize = useCallback(() => {
    const secSize = (secFiles || []).reduce((acc, file) => acc + file.size, 0)
    const glamourSize = (glamourFiles || []).reduce((acc, file) => acc + file.size, 0)
    return secSize + glamourSize
  }, [secFiles, glamourFiles])

  return {
    secFiles: secFiles || [],
    glamourFiles: glamourFiles || [],
    handleFileUpload,
    clearFiles,
    removeFile,
    getTotalFileCount,
    getTotalFileSize
  }
}