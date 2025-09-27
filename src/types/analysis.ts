import { RiskLevel } from './common'
import { PatternCorrelation, DetectionMethod } from './patterns'
import { ViolationDetection, PenaltyMatrix } from './penalties'

export interface AnalysisSummary {
  totalDocs: number
  riskScore: number
  crossReferences: number
  analysisTime: string
  aiConfidence: number
  nlpPatterns: number
}

export interface Anomaly {
  type: string
  riskLevel: RiskLevel
  description: string
  pattern: string
  aiAnalysis: string
  confidence: number
  entities: string[]
  correlationIds?: string[] // Links to pattern correlations
  sophisticationLevel?: number
}

export interface AnalysisModule {
  name: string
  processed: number
  patterns: number
  riskScore: number
  nlpInsights: string
  keyFindings: string[]
}

export interface NLPSummary {
  linguisticInconsistencies: number
  sentimentShifts: number
  entityRelationships: number
  riskLanguageInstances: number
  temporalAnomalies: number
}

export interface TemporalSequence {
  id: string
  name: string
  sequenceType: 'coordinated-timing' | 'escalating-scheme' | 'cyclical-pattern' | 'concealment-cascade' | 'regulatory-arbitrage'
  timeSpan: string
  periods: Array<{
    period: string
    events: string[]
    riskLevel: RiskLevel
    coordinationScore: number
  }>
  coordinationIndicators: {
    timingPrecision: number // How precisely timed events are (0-1)
    crossEntitySynchronization: number // Multi-entity coordination (0-1)
    regulatoryAwareness: number // Awareness of regulatory cycles (0-1)
    concealmentSophistication: number // Concealment complexity (0-1)
  }
  overallSophistication: number
  complianceImpact: string
  detectionMethod: DetectionMethod
  riskAmplification: number
}

export interface TemporalAnalysis {
  sequences: TemporalSequence[]
  totalSequences: number
  averageSophistication: number
  maxTimeSpan: string
  coordinated_schemes: number
  regulatory_cycle_exploitation: number
  multi_period_cascades: number
  temporal_concealment_patterns: number
}

export interface CrossPatternAnalysis {
  correlations: PatternCorrelation[]
  networkComplexity: number
  cascadingRiskScore: number
  multilevelViolations: Array<{
    level: number
    patterns: string[]
    description: string
    riskScore: number
  }>
  sophisticationIndex: number
  coordinationIndicators: number
  temporalAnalysis?: TemporalAnalysis // Added temporal sequence analysis
}

export interface AnalysisResult {
  summary: AnalysisSummary
  anomalies: Anomaly[]
  modules: AnalysisModule[]
  recommendations: string[]
  nlpSummary: NLPSummary
  violations?: ViolationDetection[] // Added for SEC penalty calculations
  penaltyMatrix?: PenaltyMatrix // Added for SEC penalty calculations
  crossPatternAnalysis?: CrossPatternAnalysis // Advanced correlation analysis
}

export interface NLPResults {
  findings?: Array<{
    type: string
    riskLevel: RiskLevel
    description: string
    evidence: any[]
    confidence: number
    statutory_basis: string
    false_positive_risk: 'low' | 'medium' | 'high'
  }>
  evidenceExtracts?: any[]
  nlpInsights?: {
    documentedViolations: number
    evidenceQuality: string
    manualReviewRequired: number
  }
  overallConfidence?: number
}

export class AnalysisError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message)
    this.name = 'AnalysisError'
  }
}