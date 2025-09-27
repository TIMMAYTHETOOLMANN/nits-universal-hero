import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from '../constants/analysisConfig'

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export const validateFile = (file: File): FileValidationResult => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File "${file.name}" is too large. Maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`
    }
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!SUPPORTED_FORMATS.includes(extension)) {
    return {
      isValid: false,
      error: `File "${file.name}" has unsupported format. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
    }
  }

  return { isValid: true }
}

export const validateFiles = (files: FileList | File[]): { validFiles: File[], errors: string[] } => {
  const validFiles: File[] = []
  const errors: string[] = []
  
  const fileArray = Array.from(files)
  
  fileArray.forEach(file => {
    const validation = validateFile(file)
    if (validation.isValid) {
      validFiles.push(file)
    } else if (validation.error) {
      errors.push(validation.error)
    }
  })

  return { validFiles, errors }
}