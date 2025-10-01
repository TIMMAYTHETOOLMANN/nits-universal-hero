import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Info, Warning, Scales, BookOpen } from '@phosphor-icons/react'

interface ViolationEvidence {
  exact_quote: string
  section_reference: string
  page_number?: number
  confidence_level: number
  materiality_threshold_met: boolean
  source_file?: string
}

interface EnhancedViolationItemProps {
  statute: string
  description: string
  severity: 'CRIMINAL' | 'CIVIL' | 'REGULATORY' | 'READY'
  confidence: number
  evidence: string[] | ViolationEvidence[]
  violationType?: string
  documentSource?: string
  penalty?: {
    amount: number
    currency: string
    basis: string
  }
  crossReferences?: {
    relatedStatutes: string[]
    precedentCases: string[]
  }
  riskFactors?: {
    litigation_probability: number
    regulatory_attention: number
    reputational_damage: number
  }
}

export type { ViolationEvidence, EnhancedViolationItemProps }

export const EnhancedViolationItem: React.FC<EnhancedViolationItemProps> = ({
  statute,
  description,
  severity,
  confidence,
  evidence,
  violationType,
  documentSource,
  penalty,
  crossReferences,
  riskFactors
}) => {
  const [showEvidence, setShowEvidence] = useState(false)
  const [showCrossReferences, setShowCrossReferences] = useState(false)
  const [showRiskFactors, setShowRiskFactors] = useState(false)

  const getSeverityConfig = () => {
    switch (severity) {
      case 'CRIMINAL':
        return {
          bgClass: 'border-red-500/50 bg-red-500/5',
          badgeClass: 'bg-red-500/20 text-red-400 border-red-500/50',
          iconClass: 'text-red-400',
          glowClass: 'shadow-red-500/20'
        }
      case 'CIVIL':
        return {
          bgClass: 'border-orange-500/50 bg-orange-500/5',
          badgeClass: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
          iconClass: 'text-orange-400',
          glowClass: 'shadow-orange-500/20'
        }
      case 'REGULATORY':
        return {
          bgClass: 'border-yellow-500/50 bg-yellow-500/5',
          badgeClass: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
          iconClass: 'text-yellow-400',
          glowClass: 'shadow-yellow-500/20'
        }
      default:
        return {
          bgClass: 'border-blue-500/50 bg-blue-500/5',
          badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
          iconClass: 'text-blue-400',
          glowClass: 'shadow-blue-500/20'
        }
    }
  }

  const severityConfig = getSeverityConfig()

  const formatEvidence = (evidenceItem: string | ViolationEvidence) => {
    if (typeof evidenceItem === 'string') {
      return evidenceItem
    }
    return evidenceItem.exact_quote || 'Evidence found'
  }

  const getEvidenceReference = (evidenceItem: string | ViolationEvidence) => {
    if (typeof evidenceItem === 'string') {
      return null
    }
    return evidenceItem.section_reference || evidenceItem.source_file
  }

  const getConfidenceColor = (conf: number) => {
    if (conf >= 90) return 'text-green-400'
    if (conf >= 70) return 'text-yellow-400'
    if (conf >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className={`border rounded-lg p-4 ${severityConfig.bgClass} hover:${severityConfig.glowClass} hover:shadow-lg transition-all duration-300 group`}>
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-xs ${severityConfig.badgeClass}`}>
              {severity}
            </Badge>
            <span className="text-xs text-gray-500 font-mono">{statute}</span>
            {violationType && (
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                {violationType.replace(/_/g, ' ').toUpperCase()}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-300 mb-2 leading-relaxed group-hover:text-gray-200 transition-colors">
            {description}
          </p>

          {documentSource && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <BookOpen className="w-3 h-3" />
              <span>Source: {documentSource}</span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Confidence:</span>
              <div className="flex items-center gap-1">
                <Progress value={confidence} className="w-20 h-2" />
                <span className={getConfidenceColor(confidence)}>{confidence}%</span>
              </div>
            </div>
            
            {penalty && (
              <div className="flex items-center gap-1">
                <Scales className="w-3 h-3 text-gray-500" />
                <span className="text-gray-400">
                  {penalty.currency}{penalty.amount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-gray-500 hover:text-gray-300 transition-colors"
            title="View evidence"
          >
            <Info className="w-4 h-4" />
          </button>
          
          {crossReferences && (
            <button
              onClick={() => setShowCrossReferences(!showCrossReferences)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="View cross-references"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}
          
          {riskFactors && (
            <button
              onClick={() => setShowRiskFactors(!showRiskFactors)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="View risk factors"
            >
              <Warning className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Evidence Section */}
      {showEvidence && (
        <div className="mt-3 pt-3 border-t border-gray-800 animate-fadeIn">
          <p className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Evidence ({evidence.length} items):
          </p>
          <div className="space-y-2">
            {evidence.map((item, idx) => {
              const formattedEvidence = formatEvidence(item)
              const reference = getEvidenceReference(item)
              
              return (
                <div key={idx} className="bg-gray-800/50 rounded p-3 border border-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-xs text-gray-500 mt-0.5">#{idx + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs text-gray-300 leading-relaxed mb-1">
                        {formattedEvidence}
                      </p>
                      {reference && (
                        <p className="text-xs text-gray-500 italic">
                          Reference: {reference}
                        </p>
                      )}
                      {typeof item === 'object' && item.confidence_level && (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Evidence confidence:</span>
                          <span className={`text-xs ${getConfidenceColor(item.confidence_level * 100)}`}>
                            {(item.confidence_level * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Cross-References Section */}
      {showCrossReferences && crossReferences && (
        <div className="mt-3 pt-3 border-t border-gray-800 animate-fadeIn">
          <p className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            Cross-References:
          </p>
          <div className="space-y-3">
            {crossReferences.relatedStatutes?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Related Statutes:</p>
                <div className="flex flex-wrap gap-1">
                  {crossReferences.relatedStatutes.map((relatedStatute, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs text-gray-400 border-gray-600">
                      {relatedStatute}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {crossReferences.precedentCases?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Precedent Cases:</p>
                <div className="space-y-1">
                  {crossReferences.precedentCases.map((precedent, idx) => (
                    <p key={idx} className="text-xs text-gray-400 pl-2 border-l border-gray-700">
                      {precedent}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Factors Section */}
      {showRiskFactors && riskFactors && (
        <div className="mt-3 pt-3 border-t border-gray-800 animate-fadeIn">
          <p className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-1">
            <Warning className="w-3 h-3" />
            Risk Assessment:
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Litigation</p>
              <div className="flex flex-col items-center">
                <Progress value={riskFactors.litigation_probability} className="w-full h-2 mb-1" />
                <span className={`text-xs ${getConfidenceColor(riskFactors.litigation_probability)}`}>
                  {riskFactors.litigation_probability}%
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Regulatory</p>
              <div className="flex flex-col items-center">
                <Progress value={riskFactors.regulatory_attention} className="w-full h-2 mb-1" />
                <span className={`text-xs ${getConfidenceColor(riskFactors.regulatory_attention)}`}>
                  {riskFactors.regulatory_attention}%
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Reputation</p>
              <div className="flex flex-col items-center">
                <Progress value={riskFactors.reputational_damage} className="w-full h-2 mb-1" />
                <span className={`text-xs ${getConfidenceColor(riskFactors.reputational_damage)}`}>
                  {riskFactors.reputational_damage}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Penalty Information */}
      {penalty && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Estimated Penalty:</span>
            <div className="flex items-center gap-2">
              <span className={severityConfig.iconClass}>
                {penalty.currency}{penalty.amount.toLocaleString()}
              </span>
              <span className="text-gray-500 text-xs">({penalty.basis})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedViolationItem