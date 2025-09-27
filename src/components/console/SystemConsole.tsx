import React, { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Trash } from '@phosphor-icons/react'

interface SystemConsoleProps {
  consoleLog: string[]
  onClear: () => void
  onExport?: () => string
  className?: string
  maxHeight?: string
  title?: string
}

export const SystemConsole: React.FC<SystemConsoleProps> = ({
  consoleLog,
  onClear,
  onExport,
  className = '',
  maxHeight = '300px',
  title = 'System Console'
}) => {
  const consoleRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [consoleLog])

  const handleExport = () => {
    if (!onExport) return
    
    const logContent = onExport()
    const blob = new Blob([logContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nits-console-log-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className="flex items-center gap-2">
            {consoleLog.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {consoleLog.length} messages
              </span>
            )}
            {onExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExport}
                disabled={consoleLog.length === 0}
              >
                <Download size={12} className="mr-1" />
                Export
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClear}
              disabled={consoleLog.length === 0}
            >
              <Trash size={12} className="mr-1" />
              Clear
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={consoleRef}
          className="bg-black text-green-400 font-mono text-xs p-4 overflow-y-auto"
          style={{ 
            maxHeight,
            minHeight: '200px'
          }}
        >
          {consoleLog.length === 0 ? (
            <div className="text-gray-500 italic">
              System ready. Analysis logs will appear here...
            </div>
          ) : (
            <div className="space-y-1">
              {consoleLog.map((message, index) => (
                <div 
                  key={index} 
                  className="whitespace-pre-wrap break-words"
                  style={{
                    color: message.includes('ERROR') || message.includes('FAILED') ? '#ff6b6b' :
                           message.includes('WARNING') ? '#ffd93d' :
                           message.includes('SUCCESS') || message.includes('COMPLETE') ? '#6bcf7f' :
                           message.includes('ANALYSIS') || message.includes('AI') ? '#4ecdc4' :
                           '#a8e6cf'
                  }}
                >
                  {message}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}