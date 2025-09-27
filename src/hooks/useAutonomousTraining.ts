import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { AnalysisResult } from '../types/analysis'
import { AutonomousPattern, TrainingStatus } from '../types/patterns'

// Declare spark global
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

declare const spark: Window['spark']

export const useAutonomousTraining = () => {
  const [trainingStatus, setTrainingStatus] = useKV<TrainingStatus>('training-status', {
    isActive: false,
    currentPhase: 'Idle',
    progress: 0,
    patternsGenerated: 0,
    lastTrainingTime: null,
    trainingLog: []
  })

  const [autonomousPatterns, setAutonomousPatterns] = useKV<AutonomousPattern[]>('autonomous-patterns', [])
  const [isTraining, setIsTraining] = useState(false)

  const updateTrainingStatus = useCallback((updates: Partial<TrainingStatus>) => {
    setTrainingStatus(current => ({ ...current!, ...updates }))
  }, [setTrainingStatus])

  const addToTrainingLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString()
    updateTrainingStatus({
      trainingLog: [...(trainingStatus?.trainingLog || []), `[${timestamp}] ${message}`]
    })
  }, [trainingStatus?.trainingLog, updateTrainingStatus])

  const generateAutonomousPatterns = useCallback(async (
    analysisResults: AnalysisResult,
    consoleLogger: (message: string) => void
  ) => {
    if (isTraining) return
    setIsTraining(true)

    updateTrainingStatus({
      isActive: true,
      currentPhase: 'Initializing AI Training',
      progress: 10
    })

    addToTrainingLog('Starting autonomous pattern generation...')
    consoleLogger('AI Training: Starting autonomous pattern generation')

    try {
      updateTrainingStatus({
        currentPhase: 'Analyzing Violations',
        progress: 25
      })

      if (!analysisResults.violations || analysisResults.violations.length === 0) {
        consoleLogger('No violations found for pattern generation')
        addToTrainingLog('No violations found for pattern generation')
        return
      }

      updateTrainingStatus({
        currentPhase: 'Generating AI Patterns',
        progress: 50
      })

      const prompt = spark.llmPrompt`
        Analyze these SEC violations and generate 3-5 advanced detection patterns:
        
        Violations: ${JSON.stringify(analysisResults.violations.slice(0, 3))}
        
        Generate patterns that detect:
        1. Keyword combinations and phrases
        2. Context patterns (surrounding text indicators)
        3. Timing and disclosure patterns
        4. Performance optimization patterns
        
        Return JSON format:
        {
          "patterns": [
            {
              "name": "Pattern Name",
              "violationType": "Type of violation",
              "keywords": ["keyword1", "keyword2"],
              "confidence": 0.85
            }
          ]
        }
      `

      const aiResponse = await spark.llm(prompt, "gpt-4o", true)
      const aiPatterns = JSON.parse(aiResponse)

      updateTrainingStatus({
        currentPhase: 'Generating Optimized Patterns',
        progress: 75
      })

      const newPatterns: AutonomousPattern[] = aiPatterns.patterns.map((pattern: any, index: number) => ({
        id: `auto-${Date.now()}-${index}`,
        name: pattern.name || `Auto Pattern ${index + 1}`,
        violationType: pattern.violationType || 'General',
        keywords: pattern.keywords || [],
        confidence: pattern.confidence || 0.8,
        performance: 0.85,
        isActive: true,
        generatedAt: new Date().toISOString(),
        source: 'autonomous' as const
      }))

      const existingPatterns = autonomousPatterns || []
      const uniquePatterns = newPatterns.filter(newPattern => 
        !existingPatterns.some(existingPattern => 
          JSON.stringify(existingPattern.keywords.sort()) === JSON.stringify(newPattern.keywords.sort())
        )
      )

      if (uniquePatterns.length > 0) {
        setAutonomousPatterns(current => [...(current || []), ...uniquePatterns])
        addToTrainingLog(`Generated ${uniquePatterns.length} new patterns`)
        consoleLogger(`AI Training: Generated ${uniquePatterns.length} new autonomous patterns`)
      } else {
        addToTrainingLog('No new unique patterns generated')
        consoleLogger('AI Training: No new unique patterns generated')
      }

      updateTrainingStatus({
        currentPhase: 'Training Complete',
        progress: 100,
        patternsGenerated: (trainingStatus?.patternsGenerated || 0) + uniquePatterns.length,
        lastTrainingTime: new Date().toISOString()
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addToTrainingLog(`Training error: ${errorMessage}`)
      consoleLogger(`AI Training Error: ${errorMessage}`)
      updateTrainingStatus({
        currentPhase: 'Training Failed',
        progress: 0
      })
    } finally {
      setTimeout(() => {
        setIsTraining(false)
        updateTrainingStatus({
          isActive: false,
          progress: 0
        })
      }, 2000)
    }
  }, [isTraining, autonomousPatterns, trainingStatus, setAutonomousPatterns, updateTrainingStatus, addToTrainingLog])

  const togglePattern = useCallback((patternId: string) => {
    setAutonomousPatterns(current =>
      (current || []).map(pattern =>
        pattern.id === patternId ? { ...pattern, isActive: !pattern.isActive } : pattern
      )
    )
  }, [setAutonomousPatterns])

  const deletePattern = useCallback((patternId: string) => {
    setAutonomousPatterns(current =>
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