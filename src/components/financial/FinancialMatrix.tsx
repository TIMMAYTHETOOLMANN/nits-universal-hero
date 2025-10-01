import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Calculator, 
  CurrencyDollar, 
  FileText, 
  TrendUp, 
  WarningOctagon, 
  Target,
  CaretDown,
  CaretRight,
  Download,
  Eye
} from '@phosphor-icons/react'

interface ViolationEvidence {
  id: string
  violation_type: string
  exact_quote: string
  source_file?: string
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
  financial_impact?: {
    profit_amount?: number
    penalty_base?: number
    enhancement_multiplier?: number
    total_exposure?: number
  }
  source_file_type?: string
  violation_specificity_score?: number
  location_precision?: number
  financial_data_present?: number
}

interface ViolationDetection {
  document: string
  violation_flag: string
  actor_type: 'natural_person' | 'other_person'
  count: number
  evidence: ViolationEvidence[]
  statutory_basis: string
  confidence_score: number
  false_positive_risk: string
}

interface PenaltyCalculation {
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

interface PenaltyMatrix {
  grand_total: number
  total_violations: number
  documents: { [document: string]: PenaltyCalculation[] }
  missing_statute_mappings: string[]
  calculation_timestamp: string
}

interface FinancialMatrixProps {
  violations: ViolationDetection[]
  penaltyMatrix: PenaltyMatrix | null
  isCalculating: boolean
  onExportMatrix: (format: string) => void
  onRecalculate: () => void
}

export const FinancialMatrix: React.FC<FinancialMatrixProps> = ({
  violations,
  penaltyMatrix,
  isCalculating,
  onExportMatrix,
  onRecalculate
}) => {
  const [expandedDocuments, setExpandedDocuments] = useState<Set<string>>(new Set())
  const [selectedViolation, setSelectedViolation] = useState<ViolationDetection | null>(null)

  const toggleDocument = (document: string) => {
    const newExpanded = new Set(expandedDocuments)
    if (newExpanded.has(document)) {
      newExpanded.delete(document)
    } else {
      newExpanded.add(document)
    }
    setExpandedDocuments(newExpanded)
  }

  const getRiskLevel = (amount: number): string => {
    if (amount >= 10000000) return 'critical'
    if (amount >= 5000000) return 'high'  
    if (amount >= 1000000) return 'medium'
    return 'low'
  }

  const getRiskColor = (level: string): string => {
    switch (level) {
      case 'critical': return 'text-purple-400'
      case 'high': return 'text-red-400'
      case 'medium': return 'text-orange-400'
      default: return 'text-green-400'
    }
  }

  if (!penaltyMatrix && !isCalculating) {
    return (
      <Card className="p-6 text-center">
        <Calculator size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Financial Matrix Analysis</h3>
        <p className="text-muted-foreground mb-4">
          Run a document analysis to generate the financial penalty matrix
        </p>
      </Card>
    )
  }

  if (isCalculating) {
    return (
      <Card className="p-6 text-center">
        <div className="animate-spin mb-4">
          <Calculator size={48} className="mx-auto text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Calculating SEC Penalties</h3>
        <p className="text-muted-foreground">
          Processing violations and mapping to current SEC penalty amounts...
        </p>
      </Card>
    )
  }

  if (!penaltyMatrix) return null

  const totalRiskLevel = getRiskLevel(penaltyMatrix.grand_total)
  const totalRiskColor = getRiskColor(totalRiskLevel)

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <Card className="p-6 sec-penalty-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <CurrencyDollar size={28} className="text-orange-400" />
            Financial Matrix Analysis
            <Badge variant="outline" className="text-xs ml-2">
              Current SEC Penalties 2025
            </Badge>
          </h2>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onRecalculate}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Calculator size={16} />
              Recalculate
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="penalty-total-glow p-4 rounded-lg text-center">
            <div className={`text-3xl font-bold ${totalRiskColor}`}>
              ${penaltyMatrix.grand_total.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Exposure</div>
            <Badge variant="outline" className={`mt-1 ${totalRiskColor}`}>
              {totalRiskLevel.toUpperCase()} RISK
            </Badge>
          </div>
          
          <div className="penalty-calculation-item p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-400">
              {penaltyMatrix.total_violations}
            </div>
            <div className="text-sm text-muted-foreground">Total Violations</div>
          </div>
          
          <div className="penalty-calculation-item p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-400">
              {Object.keys(penaltyMatrix.documents).length}
            </div>
            <div className="text-sm text-muted-foreground">Documents Analyzed</div>
          </div>
          
          <div className="penalty-calculation-item p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-400">
              {penaltyMatrix.missing_statute_mappings.length === 0 ? '100%' : 
               `${Math.round((1 - penaltyMatrix.missing_statute_mappings.length / penaltyMatrix.total_violations) * 100)}%`}
            </div>
            <div className="text-sm text-muted-foreground">Mapping Accuracy</div>
          </div>
        </div>
      </Card>

      {/* Export Options */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Download size={20} />
          Export Financial Matrix
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            onClick={() => onExportMatrix('csv')}
            variant="outline"
            size="sm"
            className="download-button"
          >
            <FileText size={16} className="mr-2" />
            Penalty Matrix (.csv)
          </Button>
          
          <Button
            onClick={() => onExportMatrix('json')}
            variant="outline"
            size="sm"
            className="download-button"
          >
            <FileText size={16} className="mr-2" />
            Full Analysis (.json)
          </Button>
          
          <Button
            onClick={() => onExportMatrix('txt')}
            variant="outline"
            size="sm"
            className="download-button"
          >
            <FileText size={16} className="mr-2" />
            Executive Report (.txt)
          </Button>
          
          <Button
            onClick={() => onExportMatrix('complete')}
            variant="outline"
            size="sm"
            className="download-button"
          >
            <FileText size={16} className="mr-2" />
            Complete Package
          </Button>
        </div>
      </Card>

      {/* Document-by-Document Breakdown */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target size={20} />
          Document-Specific Penalties
        </h3>
        
        <div className="space-y-2">
          {Object.entries(penaltyMatrix.documents).map(([document, calculations]) => {
            const documentTotal = calculations.reduce((sum, calc) => sum + (calc.subtotal || 0), 0)
            const documentRiskLevel = getRiskLevel(documentTotal)
            const documentRiskColor = getRiskColor(documentRiskLevel)
            const isExpanded = expandedDocuments.has(document)
            
            return (
              <Collapsible key={document}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto penalty-calculation-item"
                    onClick={() => toggleDocument(document)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
                      <FileText size={16} />
                      <div className="text-left">
                        <div className="font-medium">{document}</div>
                        <div className="text-sm text-muted-foreground">
                          {calculations.length} violations detected
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-lg font-bold ${documentRiskColor}`}>
                        ${documentTotal.toLocaleString()}
                      </div>
                      <Badge variant="outline" className={`text-xs ${documentRiskColor}`}>
                        {documentRiskLevel.toUpperCase()}
                      </Badge>
                    </div>
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="px-4 pb-4">
                  <div className="space-y-2 mt-2">
                    {calculations.map((calc, index) => (
                      <div key={index} className="p-3 rounded bg-background/50 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {calc.violation_flag}
                          </Badge>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${(calc.subtotal || 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${(calc.unit_penalty || 0).toLocaleString()} × {calc.count}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Actor Type:</span>
                            <span>{calc.actor_type === 'natural_person' ? 'Individual' : 'Corporation'}</span>
                          </div>
                          
                          {calc.sec_citation && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">SEC Citation:</span>
                              <span className="sec-citation-text">{calc.sec_citation}</span>
                            </div>
                          )}
                          
                          {calc.enhancement_applied && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Enhancement:</span>
                              <span className="text-orange-400">Applied</span>
                            </div>
                          )}
                          
                          {calc.enhancement_justification && (
                            <div className="text-xs text-muted-foreground mt-2 p-2 bg-background/50 rounded">
                              <strong>Enhancement Justification:</strong> {calc.enhancement_justification}
                            </div>
                          )}
                        </div>
                        
                        {/* Find and display evidence */}
                        {(() => {
                          const violation = violations.find(v => 
                            v.document === calc.document && v.violation_flag === calc.violation_flag
                          )
                          if (!violation || !violation.evidence.length) return null
                          
                          return (
                            <div className="mt-3 pt-2 border-t border-border/50">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedViolation(violation)}
                                className="text-xs flex items-center gap-1"
                              >
                                <Eye size={12} />
                                View Evidence ({violation.evidence.length} items)
                              </Button>
                            </div>
                          )
                        })()}
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </div>
      </Card>

      {/* Evidence Modal/Details */}
      {selectedViolation && (
        <Card className="p-4 border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <WarningOctagon size={20} className="text-orange-400" />
              Violation Evidence: {selectedViolation.violation_flag}
            </h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedViolation(null)}
            >
              Close
            </Button>
          </div>
          
          <div className="space-y-3">
            <div className="text-sm">
              <strong>Document:</strong> {selectedViolation.document}
            </div>
            <div className="text-sm">
              <strong>Confidence Score:</strong> {Math.round(selectedViolation.confidence_score * 100)}%
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Evidence Items:</h4>
              {selectedViolation.evidence.map((evidence, index) => (
                <div key={index} className="p-3 rounded bg-background/50 border border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="text-sm">
                      <strong>Source File:</strong> {evidence.source_file || selectedViolation.document}
                    </div>
                    <div className="text-sm">
                      <strong>Page/Section:</strong> {evidence.page_number ? `Page ${evidence.page_number}, ` : ''}{evidence.section_reference}
                    </div>
                    <div className="text-sm">
                      <strong>Confidence:</strong> {Math.round(evidence.confidence_level * 100)}%
                    </div>
                    <div className="text-sm">
                      <strong>Rule Violated:</strong> {evidence.rule_violated}
                    </div>
                  </div>
                  
                  <div className="text-sm mb-2">
                    <strong>Violation Quote:</strong>
                    <div className="mt-1 p-3 bg-background/50 rounded border-l-4 border-orange-500/50 italic text-muted-foreground">
                      "{evidence.exact_quote}"
                    </div>
                  </div>
                  
                  {evidence.context_before && (
                    <div className="text-xs mb-2">
                      <strong>Context Before:</strong> <span className="text-muted-foreground">{evidence.context_before}</span>
                    </div>
                  )}
                  
                  {evidence.context_after && (
                    <div className="text-xs mb-2">
                      <strong>Context After:</strong> <span className="text-muted-foreground">{evidence.context_after}</span>
                    </div>
                  )}
                  
                  {evidence.corroborating_evidence && evidence.corroborating_evidence.length > 0 && (
                    <div className="text-xs">
                      <strong>Corroborating Evidence:</strong>
                      <ul className="mt-1 space-y-1 text-muted-foreground">
                        {evidence.corroborating_evidence.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {evidence.financial_impact && (
                    <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded">
                      <div className="text-xs font-medium text-orange-400 mb-1">Financial Impact Analysis:</div>
                      <div className="text-xs space-y-1">
                        {evidence.financial_impact.profit_amount && (
                          <div>Profit Amount: ${evidence.financial_impact.profit_amount.toLocaleString()}</div>
                        )}
                        {evidence.financial_impact.penalty_base && (
                          <div>Base Penalty: ${evidence.financial_impact.penalty_base.toLocaleString()}</div>
                        )}
                        {evidence.financial_impact.enhancement_multiplier && (
                          <div>Enhancement Multiplier: {evidence.financial_impact.enhancement_multiplier}x</div>
                        )}
                        {evidence.financial_impact.total_exposure && (
                          <div className="font-medium text-orange-400">
                            Total Exposure: ${evidence.financial_impact.total_exposure.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Evidence ID: {evidence.id} | Extracted: {new Date(evidence.timestamp_extracted).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Missing Mappings Warning */}
      {penaltyMatrix.missing_statute_mappings.length > 0 && (
        <Card className="p-4 border-orange-500/30">
          <div className="flex items-center gap-2 mb-2">
            <WarningOctagon size={20} className="text-orange-400" />
            <h3 className="text-lg font-semibold">Missing Statute Mappings</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            The following violation types could not be mapped to SEC statutes:
          </p>
          <div className="flex flex-wrap gap-2">
            {penaltyMatrix.missing_statute_mappings.map((mapping) => (
              <Badge key={mapping} variant="outline" className="text-orange-400">
                {mapping}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Calculation Timestamp */}
      <div className="text-center text-xs text-muted-foreground">
        Calculations based on SEC penalty adjustments as of {new Date(penaltyMatrix.calculation_timestamp).toLocaleString()}
      </div>
    </div>
  )
}