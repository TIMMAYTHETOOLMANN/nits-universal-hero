import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnalysisResult } from '../types/analysis'

interface TrainingStatus {
  isActive: boolean
  currentPhase: string
  progress: number
  patternsGenerated: number
  trainingLog: string[]
  lastTrainingTime: string | null
}

interface AutonomousPattern {
  id: string
  name: string
  violationType: string
  keywords: string[]
  confidence: number
  performance: number
  isActive: boolean
  generatedAt: string
  source: 'autonomous' | 'manual'
}

export const useAutonomousTraining = () => {
  const [trainingStatus, setTrainingStatus] = useKV<TrainingStatus>('training-status', {
    isActive: false,
    currentPhase: 'Idle',
    progress: 0,
    patternsGenerated: 0,
    trainingLog: [],
    lastTrainingTime: null
  })

  const [autonomousPatterns, setAutonomousPatterns] = useKV<AutonomousPattern[]>('autonomous-patterns', [])
  const [isTraining, setIsTraining] = useState(false)

  const updateTrainingStatus = useCallback((updates: Partial<TrainingStatus>) => {
    setTrainingStatus((current) => {
      const currentStatus = current || {
        isActive: false,
        currentPhase: 'Idle',
        progress: 0,
        patternsGenerated: 0,
        trainingLog: [],
        lastTrainingTime: null
      }
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
      trainingLog: [...((trainingStatus?.trainingLog) || []).slice(-10), logEntry]
    })
  }, [trainingStatus, updateTrainingStatus])

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
      updateTrainingStatus({
        currentPhase: 'AI Pattern Analysis',
        progress: 50
      })

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
              "violationType": "violation_type",
              "keywords": ["keyword1", "keyword2"],
              "contextPatterns": ["pattern1", "pattern2"],
              "confidenceFactors": ["factor1", "factor2"]
            }
          ]
        }
      `

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
        confidence: 0.8,
        performance: 0.0,
        isActive: true,
        generatedAt: new Date().toISOString(),
        source: 'autonomous' as const
      }))

      // Filter out duplicate patterns
      const existingPatterns = autonomousPatterns || []
      const uniquePatterns = newPatterns.filter(newPattern => 
        !existingPatterns.some(existingPattern => 
          existingPattern.violationType === newPattern.violationType &&
          JSON.stringify(existingPattern.keywords.sort()) === JSON.stringify(newPattern.keywords.sort())
        )
      )

      if (uniquePatterns.length > 0) {
        setAutonomousPatterns((current) => [...(current || []), ...uniquePatterns])
        consoleLogger(`Generated ${uniquePatterns.length} new autonomous patterns`)
        addToTrainingLog(`Successfully generated ${uniquePatterns.length} unique patterns`)
      } else {
        consoleLogger('No new patterns generated - all patterns already exist')
        addToTrainingLog('No new unique patterns identified')
      }

      const currentPatternsCount = (trainingStatus?.patternsGenerated) || 0
      updateTrainingStatus({
        currentPhase: 'Training Complete',
        progress: 100,
        patternsGenerated: currentPatternsCount + uniquePatterns.length,
        lastTrainingTime: new Date().toISOString()
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      consoleLogger(`Autonomous training failed: ${errorMessage}`)
      addToTrainingLog(`Training error: ${errorMessage}`)
      
      updateTrainingStatus({
        currentPhase: 'Training Failed',
        progress: 0
      })
    } finally {
      setTimeout(() => {
        setIsTraining(false)
        updateTrainingStatus({
          isActive: false,
          currentPhase: 'Idle',
          progress: 0
        })
      }, 2000)
    }
  }, [isTraining, autonomousPatterns, trainingStatus, updateTrainingStatus, addToTrainingLog, setAutonomousPatterns])

  const togglePattern = useCallback((patternId: string) => {
    setAutonomousPatterns((current) =>
      (current || []).map(pattern =>
        pattern.id === patternId
          ? { ...pattern, isActive: !pattern.isActive }
          : pattern
      )
    )
  }, [setAutonomousPatterns])

  const deletePattern = useCallback((patternId: string) => {
    setAutonomousPatterns((current) =>
      (current || []).filter(pattern => pattern.id !== patternId)
    )
  }, [setAutonomousPatterns])

  const getActivePatterns = useCallback(() => {
    return (autonomousPatterns || []).filter(pattern => pattern.isActive)
  }, [autonomousPatterns])

  const clearTrainingLog = useCallback(() => {
    updateTrainingStatus({
      trainingLog: []
    })
  }, [updateTrainingStatus])

  return {
    trainingStatus,
    autonomousPatterns: autonomousPatterns || [],
    isTraining,
    generateAutonomousPatterns,
    togglePattern,
    deletePattern,
    getActivePatterns,
    clearTrainingLog
  }
}