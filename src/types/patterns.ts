import { RiskLevel } from './common'

export interface AutonomousPattern {
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

export interface TrainingStatus {
  isActive: boolean
  currentPhase: string
  progress: number
  patternsGenerated: number
  lastTrainingTime: string | null
  trainingLog: string[]
}

export type PatternCategory = 
  | 'insider-trading' 
  | 'esg-greenwashing' 
  | 'financial-engineering' 
  | 'disclosure-gap' 
  | 'litigation-risk' 
  | 'temporal-anomaly' 
  | 'custom'

export interface PatternTestResults {
  totalTests: number
  successRate: number
  falsePositives: number
  lastTestDate: string | null
}

export interface CustomPattern {
  id: string
  name: string
  description: string
  category: PatternCategory
  keywords: string[]
  rules: string[]
  severity: RiskLevel
  confidence: number
  isActive: boolean
  createdAt: string
  lastTested: string | null
  testResults: PatternTestResults
}

export type CorrelationType = 'temporal' | 'entity' | 'causal' | 'hierarchical' | 'network' | 'contextual'

export type DetectionMethod = 
  | 'statistical' 
  | 'ai-semantic' 
  | 'temporal-sequence' 
  | 'entity-network' 
  | 'linguistic-pattern' 
  | 'regulatory-cycle' 
  | 'causal-sequence'
  | 'statistical-timing' 
  | 'pattern-sequence' 
  | 'event-correlation'

export interface PatternCorrelation {
  id: string
  patterns: string[]
  correlationType: CorrelationType
  strength: number // 0-1 correlation strength
  confidence: number
  description: string
  violations: string[]
  riskAmplification: number // Risk multiplier when patterns correlate
  detectionMethod: DetectionMethod
  metadata: {
    documentSpan: number
    timeSpan: string
    entityInvolvement: string[]
    cascadeLevel: number
  }
}