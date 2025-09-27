import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from '@phosphor-icons/react'
import { FileItem } from '../../types/common'
import { SUPPORTED_FORMATS } from '../../constants/analysisConfig'
import { formatFileSize } from '../../utils/formatters'

interface DocumentUploadZoneProps {
  title: string
  description: string
  files: FileItem[]
  onFileUpload: (files: FileList | null) => void
  onClear: () => void
  className?: string
  icon?: React.ReactNode
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  title,
  description,
  files,
  onFileUpload,
  onClear,
  className = '',
  icon
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    
    if (e.dataTransfer?.files) {
      onFileUpload(e.dataTransfer.files)
    }
  }

  const handleClick = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = SUPPORTED_FORMATS.join(',')
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files) onFileUpload(target.files)
    }
    input.click()
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
        {icon}
        {title}
        {files.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClear} className="ml-auto">
            Clear
          </Button>
        )}
      </h3>
      <div
        className="upload-zone p-8 rounded-lg text-center cursor-pointer border-2 border-dashed hover:border-primary transition-colors"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          background: files.length > 0 ? 'var(--muted)' : 'transparent'
        }}
      >
        <FileText size={48} className="mx-auto mb-4 text-primary" />
        <p className="text-lg mb-2">{description}</p>
        <p className="text-sm text-muted-foreground">
          Drag files here or click to upload
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Supported: {SUPPORTED_FORMATS.join(', ')}
        </p>
        
        {files.length > 0 && (
          <div className="mt-4 space-y-1">
            {files.map((file, i) => (
              <div key={i} className="text-xs text-left bg-background p-2 rounded border">
                <div className="flex justify-between items-center">
                  <span className="font-medium truncate">{file.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Total: {files.length} files ({formatFileSize(files.reduce((acc, f) => acc + f.size, 0))})
            </div>
          </div>
        )}
      </div>
    </div>
  )
}