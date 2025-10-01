// Legal Pattern Analyzer - Enhanced ML analysis with legal context
// PURPOSE: Add legal pattern recognition to existing analysis

import type { LegalAnalysisResult, LegalViolation } from '../types/legal'

export class LegalPatternAnalyzer {
  private legalTerminology = new Set([
    // Criminal indicators
    'fraud', 'embezzlement', 'conspiracy', 'racketeering', 'bribery',
    'kickback', 'falsification', 'obstruction', 'perjury', 'forgery',
    
    // Regulatory violations
    'non-compliance', 'violation', 'breach', 'infringement', 'contravention',
    'unauthorized', 'prohibited', 'unlawful', 'illegal', 'improper',
    
    // Deception patterns
    'misrepresentation', 'omission', 'concealment', 'manipulation',
    'misstatement', 'distortion', 'fabrication', 'alteration'
  ])

  analyzeLegalCompliance(content: string): LegalAnalysisResult {
    const violations: LegalViolation[] = []
    
    // Check against ALL legal patterns
    for (const term of this.legalTerminology) {
      const pattern = new RegExp(`\\b${term}\\b`, 'gi')
      const matches = content.matchAll(pattern)
      
      for (const match of matches) {
        violations.push({
          term,
          position: match.index || 0,
          context: this.extractContext(content, match.index || 0, 200),
          severity: this.calculateLegalSeverity(term),
          confidence: 0.95
        })
      }
    }
    
    return {
      violations,
      riskScore: this.calculateLegalRiskScore(violations),
      recommendations: this.generateLegalRecommendations(violations)
    }
  }

  private extractContext(content: string, index: number, length: number): string {
    const start = Math.max(0, index - length / 2)
    const end = Math.min(content.length, index + length / 2)
    return content.substring(start, end)
  }

  private calculateLegalSeverity(term: string): 'low' | 'medium' | 'high' | 'critical' {
    const criticalTerms = ['fraud', 'embezzlement', 'bribery', 'perjury', 'forgery']
    const highTerms = ['conspiracy', 'racketeering', 'obstruction', 'falsification']
    const mediumTerms = ['violation', 'breach', 'unauthorized', 'prohibited']
    
    if (criticalTerms.includes(term.toLowerCase())) {
      return 'critical'
    } else if (highTerms.includes(term.toLowerCase())) {
      return 'high'
    } else if (mediumTerms.includes(term.toLowerCase())) {
      return 'medium'
    }
    return 'low'
  }

  private calculateLegalRiskScore(violations: LegalViolation[]): number {
    if (violations.length === 0) return 0
    
    const severityScores = {
      low: 1,
      medium: 3,
      high: 7,
      critical: 10
    }
    
    const totalScore = violations.reduce((sum, v) => sum + severityScores[v.severity], 0)
    return Math.min(10, totalScore / violations.length)
  }

  private generateLegalRecommendations(violations: LegalViolation[]): string[] {
    const recommendations: string[] = []
    
    const criticalViolations = violations.filter(v => v.severity === 'critical')
    if (criticalViolations.length > 0) {
      recommendations.push('IMMEDIATE LEGAL REVIEW REQUIRED: Critical compliance violations detected')
      recommendations.push('Consider engaging legal counsel for comprehensive compliance audit')
    }
    
    const highViolations = violations.filter(v => v.severity === 'high')
    if (highViolations.length > 0) {
      recommendations.push('High-severity violations require prompt remediation')
    }
    
    if (violations.length > 10) {
      recommendations.push('Systematic compliance review recommended due to volume of violations')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring for compliance issues')
    }
    
    return recommendations
  }

  getLegalTerminology(): Set<string> {
    return this.legalTerminology
  }

  addLegalTerm(term: string): void {
    this.legalTerminology.add(term.toLowerCase())
  }
}
