import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { CustomPattern, PatternTestResults } from '../types/patterns'
import { AnalysisResult } from '../types/analysis'
import { PatternEngine } from '../services/patternEngine'
import { DEFAULT_PATTERN_CONFIDENCE, DEFAULT_PATTERN_SEVERITY } from '../constants/analysisConfig'

export interface UsePatternReturn {
  customPatterns: CustomPattern[]
  newPattern: Partial<CustomPattern>
  testingPattern: string | null
  autoTrainingEnabled: boolean
  trainingInProgress: boolean
  trainingLog: string[]
  lastAutoTraining: string | null
  
  // Pattern management
  setNewPattern: (pattern: Partial<CustomPattern>) => void
  createCustomPattern: () => Promise<{ success: boolean, message: string }>
  deletePattern: (id: string) => void
  togglePattern: (id: string) => void
  updatePattern: (id: string, updates: Partial<CustomPattern>) => void
  
  // Pattern testing
  testPattern: (id: string, onLog: (message: string) => void) => Promise<void>
  
  // Auto training
  setAutoTrainingEnabled: (enabled: boolean) => void
  generateAutonomousPatterns: (analysisResults: AnalysisResult, onLog: (message: string) => void) => Promise<void>
  optimizeExistingPatterns: (onLog: (message: string) => void) => Promise<void>
  
  // Utilities
  getActivePatterns: () => CustomPattern[]
  getPatternById: (id: string) => CustomPattern | undefined
}

export const usePatterns = (): UsePatternReturn => {
  const [customPatterns, setCustomPatterns] = useKV<CustomPattern[]>('custom-patterns', [])
  const [autoTrainingEnabled, setAutoTrainingEnabled] = useKV<boolean>('auto-training-enabled', false)
  const [lastAutoTraining, setLastAutoTraining] = useKV<string | null>('last-auto-training', null)
  
  const [newPattern, setNewPattern] = useState<Partial<CustomPattern>>({
    name: '',
    description: '',
    category: 'custom',
    keywords: [],
    rules: [],
    severity: DEFAULT_PATTERN_SEVERITY,
    confidence: DEFAULT_PATTERN_CONFIDENCE,
    isActive: true
  })
  
  const [testingPattern, setTestingPattern] = useState<string | null>(null)
  const [trainingInProgress, setTrainingInProgress] = useState(false)
  const [trainingLog, setTrainingLog] = useState<string[]>([])

  const addToTrainingLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setTrainingLog(prev => [...prev, `[${timestamp}] ${message}`])
  }, [])

  const createCustomPattern = useCallback(async () => {
    if (!newPattern.name || !newPattern.description) {
      return { success: false, message: 'Pattern name and description are required' }
    }

    try {
      const patternEngine = PatternEngine.getInstance()
      const pattern = patternEngine.createPattern(newPattern)
      
      setCustomPatterns(prev => [...(prev || []), pattern])
      
      // Reset form
      setNewPattern({
        name: '',
        description: '',
        category: 'custom',
        keywords: [],
        rules: [],
        severity: DEFAULT_PATTERN_SEVERITY,
        confidence: DEFAULT_PATTERN_CONFIDENCE,
        isActive: true
      })
      
      return { success: true, message: `Pattern "${pattern.name}" created successfully` }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create pattern'
      return { success: false, message }
    }
  }, [newPattern, setCustomPatterns])

  const deletePattern = useCallback((id: string) => {
    const patternEngine = PatternEngine.getInstance()
    const updatedPatterns = patternEngine.deletePattern(customPatterns || [], id)
    setCustomPatterns(updatedPatterns)
  }, [customPatterns, setCustomPatterns])

  const togglePattern = useCallback((id: string) => {
    const patternEngine = PatternEngine.getInstance()
    const updatedPatterns = patternEngine.togglePatternActive(customPatterns || [], id)
    setCustomPatterns(updatedPatterns)
  }, [customPatterns, setCustomPatterns])

  const updatePattern = useCallback((id: string, updates: Partial<CustomPattern>) => {
    const patternEngine = PatternEngine.getInstance()
    const updatedPatterns = patternEngine.updatePattern(customPatterns || [], id, updates)
    setCustomPatterns(updatedPatterns)
  }, [customPatterns, setCustomPatterns])

  const testPattern = useCallback(async (id: string, onLog: (message: string) => void) => {
    const pattern = (customPatterns || []).find(p => p.id === id)
    if (!pattern) {
      onLog(`Pattern with id ${id} not found`)
      return
    }

    setTestingPattern(id)
    
    try {
      const patternEngine = PatternEngine.getInstance()
      const testResults = await patternEngine.testPattern(pattern, onLog)
      
      // Update pattern with test results
      updatePattern(id, { 
        testResults,
        lastTested: new Date().toISOString()
      })
      
    } catch (error) {
      onLog(`Pattern test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTestingPattern(null)
    }
  }, [customPatterns, updatePattern])

  const generateAutonomousPatterns = useCallback(async (
    analysisResults: AnalysisResult,
    onLog: (message: string) => void
  ) => {
    if (!autoTrainingEnabled) {
      onLog('Auto-training is disabled')
      return
    }

    setTrainingInProgress(true)
    addToTrainingLog('Starting autonomous pattern generation...')
    
    try {
      const patternEngine = PatternEngine.getInstance()
      const newPatterns = await patternEngine.generateAutonomousPatterns(
        analysisResults,
        customPatterns || [],
        addToTrainingLog
      )
      
      if (newPatterns.length > 0) {
        setCustomPatterns(prev => [...(prev || []), ...newPatterns])
        setLastAutoTraining(new Date().toISOString())
        addToTrainingLog(`Generated ${newPatterns.length} new autonomous patterns`)
        onLog(`Auto-training: Generated ${newPatterns.length} new patterns`)
      } else {
        addToTrainingLog('No new patterns generated - existing coverage adequate')
        onLog('Auto-training: No new patterns needed')
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      addToTrainingLog(`Autonomous pattern generation failed: ${message}`)
      onLog(`Auto-training failed: ${message}`)
    } finally {
      setTrainingInProgress(false)
    }
  }, [autoTrainingEnabled, customPatterns, setCustomPatterns, setLastAutoTraining, addToTrainingLog])

  const optimizeExistingPatterns = useCallback(async (onLog: (message: string) => void) => {
    setTrainingInProgress(true)
    addToTrainingLog('Starting pattern optimization...')
    
    try {
      const patternEngine = PatternEngine.getInstance()
      const optimizedPatterns = await patternEngine.optimizeExistingPatterns(
        customPatterns || [],
        addToTrainingLog
      )
      
      setCustomPatterns(optimizedPatterns)
      addToTrainingLog('Pattern optimization complete')
      onLog('Pattern optimization completed')
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      addToTrainingLog(`Pattern optimization failed: ${message}`)
      onLog(`Pattern optimization failed: ${message}`)
    } finally {
      setTrainingInProgress(false)
    }
  }, [customPatterns, setCustomPatterns, addToTrainingLog])

  const getActivePatterns = useCallback(() => {
    return (customPatterns || []).filter(p => p.isActive)
  }, [customPatterns])

  const getPatternById = useCallback((id: string) => {
    return (customPatterns || []).find(p => p.id === id)
  }, [customPatterns])

  return {
    customPatterns: customPatterns || [],
    newPattern,
    testingPattern,
    autoTrainingEnabled: autoTrainingEnabled || false,
    trainingInProgress,
    trainingLog,
    lastAutoTraining: lastAutoTraining || null,
    
    // Pattern management
    setNewPattern,
    createCustomPattern,
    deletePattern,
    togglePattern,
    updatePattern,
    
    // Pattern testing
    testPattern,
    
    // Auto training
    setAutoTrainingEnabled,
    generateAutonomousPatterns,
    optimizeExistingPatterns,
    
    // Utilities
    getActivePatterns,
    getPatternById
  }
}