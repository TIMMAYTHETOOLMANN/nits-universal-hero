import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnalysisResult } from '../types/analysis'

interface TrainingStatus {
  isActive: boolean
  currentPhase: string
  progress: number
  patternsGenerated: number
  lastTrainingTime: string | null
  trainingLog: string[]
}

interface AutonomousPattern {
  id: string
  name: string
  keywords: string[]
  violationType: string
  confidence: number
  performance: number
  generatedAt: string
  isActive: boolean
  source: 'autonomous' | 'manual'
}

const defaultTrainingStatus: TrainingStatus = {
  isActive: false,
  currentPhase: 'idle',
  progress: 0,
  patternsGenerated: 0,
  lastTrainingTime: null,
  trainingLog: []
}

export const useAutonomousTraining = () => {
  const [trainingStatus, setTrainingStatus] = useKV<TrainingStatus>('autonomous-training-status', defaultTrainingStatus)
  const [autonomousPatterns, setAutonomousPatterns] = useKV<AutonomousPattern[]>('autonomous-patterns', [])
  const [isTraining, setIsTraining] = useState(false)

  // Helper function to ensure proper typing
  const updateTrainingStatus = useCallback((updates: Partial<TrainingStatus>) => {
    setTrainingStatus((current) => {
      const currentStatus = current || defaultTrainingStatus
      return {
        ...currentStatus,
        ...updates
      }
    })
  }, [setTrainingStatus])

  const addToTrainingLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = `[${timestamp}] ${message}`
    
    updateTrainingStatus({
      trainingLog: [...((trainingStatus?.trainingLog || []).slice(-10)), logEntry]
    })
  }, [updateTrainingStatus, trainingStatus?.trainingLog])

  const generateAutonomousPatterns = useCallback(async (
    analysisResults: AnalysisResult,
    consoleLogger: (message: string) => void
  ) => {
    if (isTraining) return

    setIsTraining(true)
    updateTrainingStatus({
      isActive: true,
      currentPhase: 'Analyzing Results',
      progress: 10
    })

    consoleLogger('Starting autonomous pattern generation...')
    addToTrainingLog('Initiating autonomous training sequence')

    try {
      // Phase 1: Extract patterns from violations
      updateTrainingStatus({
        currentPhase: 'Extracting Violation Patterns',
        progress: 25
      })

      if (!analysisResults.violations || analysisResults.violations.length === 0) {
        consoleLogger('No violations found for pattern generation')
        addToTrainingLog('No violations available for pattern training')
        return
      }

      // Generate patterns using AI analysis
      const prompt = window.spark.llmPrompt`
        Analyze these forensic violations and generate optimized detection patterns:
        
        Violations: ${JSON.stringify(analysisResults.violations, null, 2)}
        
        For each unique violation type, create a pattern with:
        1. Specific keywords that led to detection
        2. Context patterns (surrounding text indicators)
        3. Confidence scoring factors
        4. Performance optimization suggestions
        
        Return JSON format:
        {
          "patterns": [
            {
              "name": "Pattern Name",
              "violationType": "violation_flag",
              "keywords": ["keyword1", "keyword2"],
              "contextPatterns": ["pattern1", "pattern2"],
              "confidenceFactors": ["factor1", "factor2"],
              "estimatedPerformance": 0.85
            }
          ]
        }
      `

      updateTrainingStatus({
        currentPhase: 'AI Pattern Analysis',
        progress: 50
      })

      const aiResponse = await window.spark.llm(prompt, 'gpt-4o', true)
      const patternData = JSON.parse(aiResponse)

      if (!patternData.patterns || !Array.isArray(patternData.patterns)) {
        throw new Error('Invalid pattern data from AI analysis')
      }

      updateTrainingStatus({
        currentPhase: 'Generating Optimized Patterns',
        progress: 75
      })

      // Convert AI patterns to autonomous patterns
      const newPatterns: AutonomousPattern[] = patternData.patterns.map((pattern: any, index: number) => ({
        id: `auto_${Date.now()}_${index}`,
        name: pattern.name || `Auto-Generated Pattern ${index + 1}`,
        keywords: pattern.keywords || [],
        violationType: pattern.violationType || 'unknown',
        confidence: pattern.estimatedPerformance || 0.8,
        performance: 0, // Will be updated based on usage
        generatedAt: new Date().toISOString(),
        isActive: true,
        source: 'autonomous' as const
      }))

      // Add new patterns to existing ones (avoiding duplicates)
      setAutonomousPatterns((current) => {
        const existing = current || []
        const filtered = newPatterns.filter(newPattern => 
          !existing.some(existingPattern => 
            existingPattern.violationType === newPattern.violationType &&
            JSON.stringify(existingPattern.keywords.sort()) === JSON.stringify(newPattern.keywords.sort())
          )
        )
        return [...existing, ...filtered]
      })

      const currentStatus = trainingStatus || defaultTrainingStatus
      updateTrainingStatus({
        currentPhase: 'Training Complete',
        progress: 100,
        patternsGenerated: currentStatus.patternsGenerated + newPatterns.length,
        lastTrainingTime: new Date().toISOString(),
        isActive: false
      })

      consoleLogger(`Generated ${newPatterns.length} autonomous patterns`)
      addToTrainingLog(`Successfully generated ${newPatterns.length} new patterns`)

      // Reset progress after completion
      setTimeout(() => {
        updateTrainingStatus({
          progress: 0,
          currentPhase: 'idle'
        })
      }, 3000)

    } catch (error) {
      console.error('Autonomous training failed:', error)
      consoleLogger(`Training failed: ${error}`)
      addToTrainingLog(`Training failed: ${error}`)
      
      updateTrainingStatus({
        isActive: false,
        currentPhase: 'Error',
        progress: 0
      })
    } finally {
      setIsTraining(false)
    }
  }, [isTraining, updateTrainingStatus, setAutonomousPatterns, addToTrainingLog, trainingStatus])

  const togglePattern = useCallback((patternId: string) => {
    setAutonomousPatterns((current) => {
      return (current || []).map(pattern => 
        pattern.id === patternId 
          ? { ...pattern, isActive: !pattern.isActive }
          : pattern
      )
    })
  }, [setAutonomousPatterns])

  const deletePattern = useCallback((patternId: string) => {
    setAutonomousPatterns((current) => {
      return (current || []).filter(pattern => pattern.id !== patternId)
    })
  }, [setAutonomousPatterns])

  const updatePatternPerformance = useCallback((patternId: string, performance: number) => {
    setAutonomousPatterns((current) => {
      return (current || []).map(pattern => 
        pattern.id === patternId 
          ? { ...pattern, performance }
          : pattern
      )
    })
  }, [setAutonomousPatterns])

  const getActivePatterns = useCallback(() => {
    return (autonomousPatterns || []).filter(pattern => pattern.isActive)
  }, [autonomousPatterns])

  const clearTrainingLog = useCallback(() => {
    updateTrainingStatus({ trainingLog: [] })
  }, [updateTrainingStatus])

  return {
    trainingStatus: trainingStatus || defaultTrainingStatus,
    autonomousPatterns: autonomousPatterns || [],
    isTraining,
    generateAutonomousPatterns,
    togglePattern,
    deletePattern,
    updatePatternPerformance,
    getActivePatterns,
    clearTrainingLog,
    addToTrainingLog
  }
}