import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { PenaltyMatrix, ViolationDetection, SEC_Penalty_Data } from '../types/penalties'
import { PenaltyCalculator } from '../services/penaltyCalculator'

export interface UsePenaltyCalculationReturn {
  penaltyCalculating: boolean
  isCalculating: boolean // Alias for backward compatibility
  penaltyMatrix: PenaltyMatrix | null
  secPenaltyData: Record<string, SEC_Penalty_Data>
  lastSecUpdate: string | null
  
  calculatePenalties: (violations: ViolationDetection[], onLog: (message: string) => void) => Promise<void>
  clearPenaltyMatrix: () => void
  refreshSecData: (onLog: (message: string) => void) => Promise<void>
  exportPenaltyMatrix: (format: string) => void
  
  // Utility functions
  getTotalExposure: () => number
  getViolationCount: () => number
  getDocumentCount: () => number
  getMissingMappings: () => string[]
  
  // Risk scoring
  calculateWeightedRiskScore: (baseScore: number) => number
}

export const usePenaltyCalculation = (): UsePenaltyCalculationReturn => {
  const [penaltyCalculating, setPenaltyCalculating] = useState(false)
  const [penaltyMatrix, setPenaltyMatrix] = useState<PenaltyMatrix | null>(null)
  const [secPenaltyData, setSecPenaltyData] = useKV<Record<string, SEC_Penalty_Data>>('sec-penalty-data', {})
  const [lastSecUpdate, setLastSecUpdate] = useKV<string | null>('last-sec-update', null)

  const calculatePenalties = useCallback(async (
    violations: ViolationDetection[],
    onLog: (message: string) => void
  ) => {
    if (!violations || violations.length === 0) {
      onLog('No violations provided for penalty calculation')
      return
    }

    setPenaltyCalculating(true)
    
    try {
      const penaltyCalculator = PenaltyCalculator.getInstance()
      const matrix = await penaltyCalculator.calculateViolationPenalties(violations, onLog)
      
      setPenaltyMatrix(matrix)
      onLog(`Penalty calculation complete: $${matrix.grand_total.toLocaleString()} total exposure`)
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Penalty calculation failed'
      onLog(`Penalty calculation error: ${message}`)
      setPenaltyMatrix(null)
    } finally {
      setPenaltyCalculating(false)
    }
  }, [])

  const clearPenaltyMatrix = useCallback(() => {
    setPenaltyMatrix(null)
  }, [])

  const refreshSecData = useCallback(async (onLog: (message: string) => void) => {
    try {
      onLog('Refreshing SEC penalty data...')
      const penaltyCalculator = PenaltyCalculator.getInstance()
      await penaltyCalculator.initializePenaltyData()
      setLastSecUpdate(new Date().toISOString())
      onLog('SEC penalty data updated successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to refresh SEC data'
      onLog(`SEC data refresh error: ${message}`)
    }
  }, [setLastSecUpdate])

  const getTotalExposure = useCallback(() => {
    return penaltyMatrix?.grand_total || 0
  }, [penaltyMatrix])

  const getViolationCount = useCallback(() => {
    return penaltyMatrix?.total_violations || 0
  }, [penaltyMatrix])

  const getDocumentCount = useCallback(() => {
    return penaltyMatrix ? Object.keys(penaltyMatrix.documents).length : 0
  }, [penaltyMatrix])

  const getMissingMappings = useCallback(() => {
    return penaltyMatrix?.missing_statute_mappings || []
  }, [penaltyMatrix])

  const exportPenaltyMatrix = useCallback((format: string) => {
    if (!penaltyMatrix) return
    
    const penaltyCalculator = PenaltyCalculator.getInstance()
    penaltyCalculator.exportPenaltyMatrix(penaltyMatrix, format)
  }, [penaltyMatrix])

  const calculateWeightedRiskScore = useCallback((baseScore: number) => {
    if (!penaltyMatrix) return baseScore
    
    const penaltyCalculator = PenaltyCalculator.getInstance()
    return penaltyCalculator.calculateWeightedRiskScore(baseScore, penaltyMatrix)
  }, [penaltyMatrix])

  return {
    penaltyCalculating,
    isCalculating: penaltyCalculating, // Alias for backward compatibility
    penaltyMatrix,
    secPenaltyData: secPenaltyData || {},
    lastSecUpdate: lastSecUpdate || null,
    
    calculatePenalties,
    clearPenaltyMatrix,
    refreshSecData,
    exportPenaltyMatrix,
    
    // Utility functions
    getTotalExposure,
    getViolationCount,
    getDocumentCount,
    getMissingMappings,
    
    // Risk scoring
    calculateWeightedRiskScore
  }
}