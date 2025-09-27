import { useState, useCallback } from 'react'
import { AnalysisResult } from '../types/analysis'
import { FileItem } from '../types/common'  
import { CustomPattern } from '../types/patterns'
import { AnalysisEngine } from '../services/analysisEngine'

export interface UseAnalysisReturn {
  isAnalyzing: boolean
  analysisProgress: number
  analysisPhase: string
  results: AnalysisResult | null
  error: string | null
  executeAnalysis: (
    secFiles: FileItem[],
    glamourFiles: FileItem[],
    customPatterns: CustomPattern[],
    onLog: (message: string) => void
  ) => Promise<void>
  clearResults: () => void
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisPhase, setAnalysisPhase] = useState('')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const executeAnalysis = useCallback(async (
    secFiles: FileItem[],
    glamourFiles: FileItem[],
    customPatterns: CustomPattern[],
    onLog: (message: string) => void
  ) => {
    if ((secFiles?.length || 0) === 0 && (glamourFiles?.length || 0) === 0) {
      setError('Please upload at least one document')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResults(null)
    setAnalysisProgress(0)
    setAnalysisPhase('')
    
    try {
      const analysisEngine = AnalysisEngine.getInstance()
      const result = await analysisEngine.executeAnalysis(
        secFiles,
        glamourFiles,
        customPatterns,
        (phase, progress) => {
          setAnalysisPhase(phase)
          setAnalysisProgress(progress)
        },
        onLog
      )
      
      setResults(result)
      onLog('Analysis completed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setError(errorMessage)
      onLog(`Analysis error: ${errorMessage}`)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults(null)
    setError(null)
    setAnalysisProgress(0)
    setAnalysisPhase('')
  }, [])

  return {
    isAnalyzing,
    analysisProgress,
    analysisPhase,
    results,
    error,
    executeAnalysis,
    clearResults
  }
}