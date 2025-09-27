import { ActorType, FalsePositiveRisk, RiskLevel } from './common'

export interface ViolationEvidence {
  id: string
  violation_type: string
  exact_quote: string
  source_file?: string // Added for file-specific tracking
  page_number?: number
  section_reference: string
  context_before: string
  context_after: string
  rule_violated: string
  legal_standard: string
  materiality_threshold_met: boolean
  corroborating_evidence: string[]
  hyperlink_anchor?: string
  timestamp_extracted: string
  confidence_level: number
  manual_review_required: boolean
  financial_impact?: { // Added for exact financial calculations
    profit_amount?: number
    penalty_base?: number
    enhancement_multiplier?: number
    total_exposure?: number
  }
  source_file_type?: string // Added for penalty calculation context
  violation_specificity_score?: number // Added for evidence quality scoring
  location_precision?: number // Added for location accuracy scoring
  financial_data_present?: number // Added for financial data presence indicator
}

export interface ViolationDetection {
  document: string
  violation_flag: string
  actor_type: ActorType
  count: number
  profit_amount?: number // For 3x profit calculations in insider trading
  evidence: ViolationEvidence[]
  statutory_basis: string
  confidence_score: number
  false_positive_risk: FalsePositiveRisk
}

export interface SEC_Penalty_Data {
  statute: string
  natural_person: number
  other_person: number
  raw_numbers: number[]
  context_line: string
}

export interface PenaltyCalculation {
  document: string
  violation_flag: string
  actor_type: string
  count: number
  unit_penalty: number | null
  subtotal: number | null
  statute_used: string | null
  sec_citation: string | null
  evidence_based: boolean
  enhancement_applied: boolean
  enhancement_justification: string | null
  base_penalty_reason: string
  manual_review_flagged: boolean
}

export interface PenaltyMatrix {
  documents: Record<string, PenaltyCalculation[]>
  grand_total: number
  missing_statute_mappings: string[]
  sec_release_version: string
  calculation_timestamp: string
  total_violations: number
  note: string
}

export interface PenaltyEnhancementResult {
  enhanced_penalty: number
  enhancement_factor: number
  justification: string
  evidence_quality_score: number
  location_precision_score: number
  financial_data_score: number
}