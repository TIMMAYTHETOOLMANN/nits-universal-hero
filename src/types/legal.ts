// Type definitions for legal document processing and analysis

export interface ParsedLegalDocument {
  id: string
  title: string
  content: string
  sections: Section[]
  metadata: DocumentMetadata
}

export interface Section {
  number: string
  title: string
  content: string
  subsections?: Section[]
}

export interface DocumentMetadata {
  source: string
  date: string
  version: string
  category: string
  pageCount: number
}

export interface LegalProvision {
  type: string
  reference: string
  context: string
  documentId: string
  severity: 'criminal' | 'civil' | 'administrative' | 'regulatory'
  penalties?: string[]
}

export interface DocumentChunk {
  pageNumber: number
  text: string
  tables: Table[]
  footnotes: string[]
  citations: string[]
  definitions: string[]
  crossReferences: string[]
}

export interface Table {
  headers: string[]
  rows: string[][]
  caption?: string
}

export interface PDFPage {
  content: string
  header?: string
  footer?: string
  marginNotes?: string[]
}

export interface Violation {
  type: 'STATUTE_VIOLATION' | 'IMPLIED_VIOLATION' | 'CROSS_REFERENCE_VIOLATION'
  statute: string
  description: string
  evidence: string[]
  severity: 'CRIMINAL' | 'CIVIL' | 'ADMINISTRATIVE'
  confidenceScore: number
  legalCitation: string
  penalties?: string[]
}

export interface ViolationReport {
  documentName: string
  totalViolations: number
  criticalViolations: Violation[]
  violations: Violation[]
  processingTime: number
  legalCitations: string[]
  prosecutionReady: boolean
}

export interface ViolationPattern {
  pattern: RegExp
  type: string
  severity: 'criminal' | 'civil' | 'administrative' | 'regulatory'
  description: string
}

export interface DetectionRule {
  id: string
  name: string
  condition: (content: string) => boolean
  severity: 'criminal' | 'civil' | 'administrative' | 'regulatory'
}

export interface RegulatoryUpdate {
  type: 'NEW_REGULATION' | 'AMENDMENT' | 'ENFORCEMENT_ACTION'
  title: string
  content: string
  effectiveDate: string
  source: string
}

export interface LegalAnalysisResult {
  violations: LegalViolation[]
  riskScore: number
  recommendations: string[]
}

export interface LegalViolation {
  term: string
  position: number
  context: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
}

export interface CFRMetadata {
  name: string
  volumes: number
  pages: number
}
