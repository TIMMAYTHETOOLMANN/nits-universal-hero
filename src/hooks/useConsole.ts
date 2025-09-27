import { useState, useCallback } from 'react'
import { formatDisplayTime } from '../utils/dateUtils'

export interface UseConsoleReturn {
  consoleLog: string[]
  addToConsole: (message: string) => void
  clearConsole: () => void
  exportConsoleLog: () => string
  getLastNMessages: (n: number) => string[]
}

export const useConsole = (): UseConsoleReturn => {
  const [consoleLog, setConsoleLog] = useState<string[]>([])

  const addToConsole = useCallback((message: string) => {
    const timestamp = formatDisplayTime()
    const formattedMessage = `[${timestamp}] ${message}`
    
    setConsoleLog(prev => {
      const newLog = [...prev, formattedMessage]
      // Keep only the last 1000 messages to prevent memory issues
      return newLog.length > 1000 ? newLog.slice(-1000) : newLog
    })
  }, [])

  const clearConsole = useCallback(() => {
    setConsoleLog([])
  }, [])

  const exportConsoleLog = useCallback(() => {
    const header = `NITS Universal Forensic Intelligence System - Console Log Export\nGenerated: ${new Date().toISOString()}\n${'-'.repeat(80)}\n\n`
    return header + consoleLog.join('\n')
  }, [consoleLog])

  const getLastNMessages = useCallback((n: number) => {
    return consoleLog.slice(-n)
  }, [consoleLog])

  return {
    consoleLog,
    addToConsole,
    clearConsole,
    exportConsoleLog,
    getLastNMessages
  }
}