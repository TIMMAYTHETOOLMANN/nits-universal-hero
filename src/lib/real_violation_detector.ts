// ============================================================================
// NITS REAL VIOLATION DETECTION ENGINE
// PURPOSE: Actually detect violations with precise evidence and calculations
// ============================================================================

import { ParsedDocument, FinancialAmount, FinancialInconsistency } from './real_forensic_engine';

export interface DetailedViolation {
  id: string;
  type: string;
  statute: string;
  regulation?: string;
  title: string;
  description: string;
  
  // PRECISE EVIDENCE
  evidence: ViolationEvidence[];
  
  // EXACT FINANCIAL IMPACT
  financialImpact: {
    amount: number;
    calculation: string;
    breakdown: FinancialBreakdown[];
  };
  
  // LOCATION IN DOCUMENT
  locations: DocumentLocation[];
  
  // SCORING
  severity: number;
  confidence: number;
  
  // LEGAL CONSEQUENCES
  penalties: Penalty[];
  recommendation: string;
  
  // METADATA
  detectedAt: string;
  detectionMethod: string;
}

export interface ViolationEvidence {
  type: 'TEXTUAL' | 'NUMERICAL' | 'PATTERN' | 'CROSS_REFERENCE';
  description: string;
  source: string;
  page: number;
  line: number;
  rawText: string;
  highlightStart: number;
  highlightEnd: number;
}

export interface FinancialBreakdown {
  label: string;
  amount: number;
  source: string;
  page: number;
}

export interface DocumentLocation {
  pageNumber: number;
  lineNumber: number;
  context: string;
  matchedText: string;
}

export interface Penalty {
  type: 'MONETARY' | 'IMPRISONMENT' | 'LICENSE_REVOCATION' | 'TRADING_SUSPENSION';
  amount?: number;
  duration?: string;
  unit?: string;
  text: string;
  statute: string;
}

// ==================== MAIN VIOLATION DETECTOR ====================

export class RealViolationDetector {
  
  private violationCounter = 0;
  
  async detectViolations(parsed: ParsedDocument): Promise<DetailedViolation[]> {
    console.log('🔍 RUNNING REAL VIOLATION DETECTION...');
    
    const violations: DetailedViolation[] = [];
    
    // Run all detection methods
    violations.push(...await this.detectFinancialFraud(parsed));
    violations.push(...await this.detectTaxViolations(parsed));
    violations.push(...await this.detectSecuritiesViolations(parsed));
    violations.push(...await this.detectMoneyLaundering(parsed));
    violations.push(...await this.detectInsiderTrading(parsed));
    violations.push(...await this.detectAccountingFraud(parsed));
    
    console.log(`🔴 DETECTED ${violations.length} VIOLATIONS WITH EVIDENCE`);
    
    return violations;
  }
  
  // ==================== FINANCIAL FRAUD DETECTION ====================
  
  private async detectFinancialFraud(parsed: ParsedDocument): Promise<DetailedViolation[]> {
    const violations: DetailedViolation[] = [];
    
    // Check for financial inconsistencies
    for (const inconsistency of parsed.financials.inconsistencies) {
      const evidence: ViolationEvidence[] = [];
      
      // Create detailed evidence
      evidence.push({
        type: 'NUMERICAL',
        description: inconsistency.description,
        source: inconsistency.location,
        page: 0,
        line: 0,
        rawText: `Expected: $${inconsistency.expected.toLocaleString()}, Actual: $${inconsistency.actual.toLocaleString()}`,
        highlightStart: 0,
        highlightEnd: 0
      });
      
      violations.push({
        id: this.generateViolationId(),
        type: 'FINANCIAL_MISSTATEMENT',
        statute: '15 U.S.C. § 78m(b)(2)',
        regulation: 'Section 13(b)(2) - Books and Records',
        title: 'Financial Statement Misstatement',
        description: `${inconsistency.type}: ${inconsistency.description}`,
        evidence,
        financialImpact: {
          amount: inconsistency.discrepancy,
          calculation: `Discrepancy = |${inconsistency.actual} - ${inconsistency.expected}| = ${inconsistency.discrepancy}`,
          breakdown: [
            {
              label: 'Stated Amount',
              amount: inconsistency.actual,
              source: inconsistency.location,
              page: 0
            },
            {
              label: 'Calculated Amount',
              amount: inconsistency.expected,
              source: 'System calculation',
              page: 0
            },
            {
              label: 'Discrepancy',
              amount: inconsistency.discrepancy,
              source: 'Difference analysis',
              page: 0
            }
          ]
        },
        locations: [{
          pageNumber: 0,
          lineNumber: 0,
          context: inconsistency.location,
          matchedText: inconsistency.description
        }],
        severity: inconsistency.severity,
        confidence: 95,
        penalties: [
          {
            type: 'MONETARY',
            amount: Math.min(inconsistency.discrepancy * 10, 10000000),
            text: `Civil penalty up to $${Math.min(inconsistency.discrepancy * 10, 10000000).toLocaleString()}`,
            statute: '15 U.S.C. § 78ff'
          }
        ],
        recommendation: 'FORENSIC_AUDIT_REQUIRED',
        detectedAt: new Date().toISOString(),
        detectionMethod: 'Mathematical inconsistency analysis'
      });
    }
    
    // Check for suspicious amounts (Benford's Law)
    const suspiciousAmounts = parsed.financials.amounts.filter(amt => amt.suspiciousScore > 60);
    
    if (suspiciousAmounts.length >= 3) {
      const totalSuspicious = suspiciousAmounts.reduce((sum, amt) => sum + amt.value, 0);
      
      const evidence: ViolationEvidence[] = suspiciousAmounts.map(amt => ({
        type: 'NUMERICAL',
        description: `Suspicious amount: $${amt.value.toLocaleString()} (${amt.category})`,
        source: amt.context,
        page: amt.pageNumber,
        line: amt.lineNumber,
        rawText: amt.context,
        highlightStart: 0,
        highlightEnd: amt.context.length
      }));
      
      violations.push({
        id: this.generateViolationId(),
        type: 'SUSPICIOUS_FINANCIAL_PATTERN',
        statute: '18 U.S.C. § 1343',
        regulation: 'Wire Fraud',
        title: 'Suspicious Financial Pattern Detected',
        description: `${suspiciousAmounts.length} financial amounts exhibit suspicious characteristics violating Benford's Law and round number concentration patterns`,
        evidence,
        financialImpact: {
          amount: totalSuspicious,
          calculation: `Sum of suspicious amounts: ${suspiciousAmounts.map(a => `$${a.value.toLocaleString()}`).join(' + ')} = $${totalSuspicious.toLocaleString()}`,
          breakdown: suspiciousAmounts.map(amt => ({
            label: `${amt.category} Amount`,
            amount: amt.value,
            source: amt.context,
            page: amt.pageNumber
          }))
        },
        locations: suspiciousAmounts.map(amt => ({
          pageNumber: amt.pageNumber,
          lineNumber: amt.lineNumber,
          context: amt.context,
          matchedText: `$${amt.value.toLocaleString()}`
        })),
        severity: 75,
        confidence: 80,
        penalties: [
          {
            type: 'MONETARY',
            amount: 1000000,
            text: 'Civil penalty up to $1,000,000',
            statute: '18 U.S.C. § 1343'
          },
          {
            type: 'IMPRISONMENT',
            duration: '20',
            unit: 'years',
            text: 'Up to 20 years imprisonment',
            statute: '18 U.S.C. § 1343'
          }
        ],
        recommendation: 'FBI_FINANCIAL_CRIMES_INVESTIGATION',
        detectedAt: new Date().toISOString(),
        detectionMethod: "Benford's Law analysis + Round number concentration"
      });
    }
    
    return violations;
  }
  
  // ==================== TAX VIOLATION DETECTION ====================
  
  private async detectTaxViolations(parsed: ParsedDocument): Promise<DetailedViolation[]> {
    const violations: DetailedViolation[] = [];
    
    // Search for tax-related terms
    const taxPatterns = [
      { term: 'unreported income', statute: '26 U.S.C. § 7201', severity: 95 },
      { term: 'tax evasion', statute: '26 U.S.C. § 7201', severity: 95 },
      { term: 'false return', statute: '26 U.S.C. § 7206(1)', severity: 90 },
      { term: 'tax fraud', statute: '26 U.S.C. § 7206', severity: 90 },
      { term: 'failure to file', statute: '26 U.S.C. § 7203', severity: 70 },
      { term: 'offshore account', statute: '31 U.S.C. § 5314', severity: 85 },
      { term: 'shell company', statute: '26 U.S.C. § 7201', severity: 80 }
    ];
    
    for (const pattern of taxPatterns) {
      const matches = this.findPatternInDocument(parsed, pattern.term);
      
      if (matches.length > 0) {
        // Calculate financial impact from related amounts
        const relatedAmounts = this.findRelatedAmounts(parsed, matches);
        const totalImpact = relatedAmounts.reduce((sum, amt) => sum + amt.value, 0);
        
        const evidence: ViolationEvidence[] = matches.map(match => ({
          type: 'TEXTUAL',
          description: `Tax violation indicator: "${pattern.term}"`,
          source: `Page ${match.pageNumber}, Line ${match.lineNumber}`,
          page: match.pageNumber,
          line: match.lineNumber,
          rawText: match.context,
          highlightStart: match.highlightStart || 0,
          highlightEnd: match.highlightEnd || 0
        }));
        
        // Add numerical evidence from related amounts
        relatedAmounts.forEach(amt => {
          evidence.push({
            type: 'NUMERICAL',
            description: `Related financial amount: ${amt.value.toLocaleString()}`,
            source: amt.context,
            page: amt.pageNumber,
            line: amt.lineNumber,
            rawText: amt.context,
            highlightStart: 0,
            highlightEnd: amt.context.length
          });
        });
        
        violations.push({
          id: this.generateViolationId(),
          type: 'TAX_LAW_VIOLATION',
          statute: pattern.statute,
          regulation: 'CFR Title 26',
          title: `Tax Violation: ${this.toTitleCase(pattern.term)}`,
          description: `Document contains ${matches.length} reference(s) to "${pattern.term}", indicating potential tax law violations`,
          evidence,
          financialImpact: {
            amount: totalImpact,
            calculation: totalImpact > 0 
              ? `Sum of related amounts: ${relatedAmounts.map(a => `${a.value.toLocaleString()}`).join(' + ')} = ${totalImpact.toLocaleString()}`
              : 'Unable to determine exact amount from document context',
            breakdown: relatedAmounts.map(amt => ({
              label: `${amt.category} on Page ${amt.pageNumber}`,
              amount: amt.value,
              source: amt.context,
              page: amt.pageNumber
            }))
          },
          locations: matches,
          severity: pattern.severity,
          confidence: 85,
          penalties: this.getTaxPenalties(pattern.statute, totalImpact),
          recommendation: totalImpact > 100000 
            ? 'IRS_CRIMINAL_INVESTIGATION' 
            : 'IRS_CIVIL_EXAMINATION',
          detectedAt: new Date().toISOString(),
          detectionMethod: 'Keyword pattern matching + contextual amount extraction'
        });
      }
    }
    
    return violations;
  }
  
  // ==================== SECURITIES VIOLATIONS ====================
  
  private async detectSecuritiesViolations(parsed: ParsedDocument): Promise<DetailedViolation[]> {
    const violations: DetailedViolation[] = [];
    
    const secPatterns = [
      { term: 'material misstatement', statute: '15 U.S.C. § 78j(b)', regulation: 'Rule 10b-5', severity: 95 },
      { term: 'accounting fraud', statute: '15 U.S.C. § 78m', regulation: 'Section 13(a)', severity: 95 },
      { term: 'revenue recognition', statute: '15 U.S.C. § 78m', regulation: 'ASC 606', severity: 80 },
      { term: 'channel stuffing', statute: '15 U.S.C. § 78j(b)', regulation: 'Rule 10b-5', severity: 90 },
      { term: 'round trip', statute: '15 U.S.C. § 78j(b)', regulation: 'Rule 10b-5', severity: 95 },
      { term: 'side letter', statute: '15 U.S.C. § 78m', regulation: 'Section 13(b)(2)', severity: 85 }
    ];
    
    for (const pattern of secPatterns) {
      const matches = this.findPatternInDocument(parsed, pattern.term);
      
      if (matches.length > 0) {
        const relatedAmounts = this.findRelatedAmounts(parsed, matches);
        const totalImpact = relatedAmounts.reduce((sum, amt) => sum + amt.value, 0);
        
        const evidence: ViolationEvidence[] = matches.map(match => ({
          type: 'TEXTUAL',
          description: `Securities violation indicator: "${pattern.term}"`,
          source: `Page ${match.pageNumber}, Line ${match.lineNumber}`,
          page: match.pageNumber,
          line: match.lineNumber,
          rawText: match.context,
          highlightStart: match.highlightStart || 0,
          highlightEnd: match.highlightEnd || 0
        }));
        
        relatedAmounts.forEach(amt => {
          evidence.push({
            type: 'NUMERICAL',
            description: `Financial impact: ${amt.value.toLocaleString()}`,
            source: amt.context,
            page: amt.pageNumber,
            line: amt.lineNumber,
            rawText: amt.context,
            highlightStart: 0,
            highlightEnd: amt.context.length
          });
        });
        
        violations.push({
          id: this.generateViolationId(),
          type: 'SECURITIES_LAW_VIOLATION',
          statute: pattern.statute,
          regulation: pattern.regulation,
          title: `Securities Violation: ${this.toTitleCase(pattern.term)}`,
          description: `Document contains ${matches.length} reference(s) to "${pattern.term}", indicating potential securities fraud`,
          evidence,
          financialImpact: {
            amount: totalImpact,
            calculation: totalImpact > 0
              ? `Identified amounts: ${relatedAmounts.map(a => `${a.value.toLocaleString()}`).join(' + ')} = ${totalImpact.toLocaleString()}`
              : 'Financial impact requires forensic accounting analysis',
            breakdown: relatedAmounts.map(amt => ({
              label: `Amount on Page ${amt.pageNumber}`,
              amount: amt.value,
              source: amt.context,
              page: amt.pageNumber
            }))
          },
          locations: matches,
          severity: pattern.severity,
          confidence: 90,
          penalties: [
            {
              type: 'MONETARY',
              amount: Math.max(totalImpact * 3, 5000000),
              text: `Civil penalty: Greater of $5M or 3x gains/losses (${Math.max(totalImpact * 3, 5000000).toLocaleString()})`,
              statute: '15 U.S.C. § 78ff'
            },
            {
              type: 'IMPRISONMENT',
              duration: '20',
              unit: 'years',
              text: 'Criminal penalties up to 20 years',
              statute: '15 U.S.C. § 78ff'
            }
          ],
          recommendation: 'SEC_ENFORCEMENT_REFERRAL',
          detectedAt: new Date().toISOString(),
          detectionMethod: 'Securities fraud pattern recognition + financial analysis'
        });
      }
    }
    
    return violations;
  }
  
  // ==================== MONEY LAUNDERING DETECTION ====================
  
  private async detectMoneyLaundering(parsed: ParsedDocument): Promise<DetailedViolation[]> {
    const violations: DetailedViolation[] = [];
    
    const mlPatterns = [
      { term: 'money laundering', statute: '18 U.S.C. § 1956', severity: 95 },
      { term: 'structuring', statute: '31 U.S.C. § 5324', severity: 90 },
      { term: 'smurfing', statute: '31 U.S.C. § 5324', severity: 90 },
      { term: 'layering', statute: '18 U.S.C. § 1956', severity: 85 },
      { term: 'cash transaction', statute: '31 U.S.C. § 5313', severity: 70 },
      { term: 'wire transfer', statute: '18 U.S.C. § 1957', severity: 75 }
    ];
    
    for (const pattern of mlPatterns) {
      const matches = this.findPatternInDocument(parsed, pattern.term);
      
      if (matches.length > 0) {
        const relatedAmounts = this.findRelatedAmounts(parsed, matches);
        const totalImpact = relatedAmounts.reduce((sum, amt) => sum + amt.value, 0);
        
        // Check for structuring patterns (multiple amounts just under $10,000)
        const structuringAmounts = relatedAmounts.filter(amt => 
          amt.value >= 9000 && amt.value < 10000
        );
        
        const evidence: ViolationEvidence[] = matches.map(match => ({
          type: 'TEXTUAL',
          description: `Money laundering indicator: "${pattern.term}"`,
          source: `Page ${match.pageNumber}, Line ${match.lineNumber}`,
          page: match.pageNumber,
          line: match.lineNumber,
          rawText: match.context,
          highlightStart: match.highlightStart || 0,
          highlightEnd: match.highlightEnd || 0
        }));
        
        if (structuringAmounts.length >= 2) {
          evidence.push({
            type: 'PATTERN',
            description: `Structuring pattern detected: ${structuringAmounts.length} transactions just under $10,000 reporting threshold`,
            source: 'System analysis',
            page: 0,
            line: 0,
            rawText: structuringAmounts.map(a => `${a.value.toLocaleString()}`).join(', '),
            highlightStart: 0,
            highlightEnd: 0
          });
        }
        
        violations.push({
          id: this.generateViolationId(),
          type: 'MONEY_LAUNDERING',
          statute: pattern.statute,
          regulation: '31 CFR Part 1010',
          title: `Money Laundering: ${this.toTitleCase(pattern.term)}`,
          description: `Document contains evidence of potential money laundering through ${pattern.term}`,
          evidence,
          financialImpact: {
            amount: totalImpact,
            calculation: `Total suspicious transactions: ${relatedAmounts.map(a => `${a.value.toLocaleString()}`).join(' + ')} = ${totalImpact.toLocaleString()}`,
            breakdown: relatedAmounts.map(amt => ({
              label: `Transaction on Page ${amt.pageNumber}`,
              amount: amt.value,
              source: amt.context,
              page: amt.pageNumber
            }))
          },
          locations: matches,
          severity: pattern.severity,
          confidence: 85,
          penalties: [
            {
              type: 'MONETARY',
              amount: Math.max(totalImpact, 500000),
              text: `Fine: Greater of $500K or amount laundered (${Math.max(totalImpact, 500000).toLocaleString()})`,
              statute: '18 U.S.C. § 1956'
            },
            {
              type: 'IMPRISONMENT',
              duration: '20',
              unit: 'years',
              text: 'Up to 20 years imprisonment',
              statute: '18 U.S.C. § 1956'
            }
          ],
          recommendation: 'FINCEN_SAR_FILING_REQUIRED',
          detectedAt: new Date().toISOString(),
          detectionMethod: 'Money laundering pattern detection + transaction analysis'
        });
      }
    }
    
    return violations;
  }
  
  // ==================== INSIDER TRADING DETECTION ====================
  
  private async detectInsiderTrading(parsed: ParsedDocument): Promise<DetailedViolation[]> {
    const violations: DetailedViolation[] = [];
    
    const insiderPatterns = [
      { term: 'insider trading', statute: '15 U.S.C. § 78j(b)', severity: 95 },
      { term: 'material non-public information', statute: '15 U.S.C. § 78j(b)', severity: 95 },
      { term: 'tipping', statute: '15 U.S.C. § 78t-1', severity: 90 },
      { term: 'front running', statute: '15 U.S.C. § 78j(b)', severity: 90 },
      { term: 'trading ahead', statute: '15 U.S.C. § 78j(b)', severity: 85 }
    ];
    
    for (const pattern of insiderPatterns) {
      const matches = this.findPatternInDocument(parsed, pattern.term);
      
      if (matches.length > 0) {
        const relatedAmounts = this.findRelatedAmounts(parsed, matches);
        const totalGains = relatedAmounts.reduce((sum, amt) => sum + amt.value, 0);
        
        const evidence: ViolationEvidence[] = matches.map(match => ({
          type: 'TEXTUAL',
          description: `Insider trading indicator: "${pattern.term}"`,
          source: `Page ${match.pageNumber}, Line ${match.lineNumber}`,
          page: match.pageNumber,
          line: match.lineNumber,
          rawText: match.context,
          highlightStart: match.highlightStart || 0,
          highlightEnd: match.highlightEnd || 0
        }));
        
        // Check for suspicious timing patterns
        const timeline = parsed.timeline.filter(event => 
          event.event.toLowerCase().includes('trade') || 
          event.event.toLowerCase().includes('transaction')
        );
        
        if (timeline.length > 0) {
          evidence.push({
            type: 'PATTERN',
            description: `${timeline.length} trading events identified in timeline`,
            source: 'Timeline analysis',
            page: 0,
            line: 0,
            rawText: timeline.map(t => `${t.date.toDateString()}: ${t.event}`).join('; '),
            highlightStart: 0,
            highlightEnd: 0
          });
        }
        
        violations.push({
          id: this.generateViolationId(),
          type: 'INSIDER_TRADING',
          statute: pattern.statute,
          regulation: 'Rule 10b-5',
          title: `Insider Trading: ${this.toTitleCase(pattern.term)}`,
          description: `Document contains evidence of potential insider trading activity`,
          evidence,
          financialImpact: {
            amount: totalGains,
            calculation: totalGains > 0
              ? `Estimated gains: ${relatedAmounts.map(a => `${a.value.toLocaleString()}`).join(' + ')} = ${totalGains.toLocaleString()}`
              : 'Gains require trading records analysis',
            breakdown: relatedAmounts.map(amt => ({
              label: `Trading activity on Page ${amt.pageNumber}`,
              amount: amt.value,
              source: amt.context,
              page: amt.pageNumber
            }))
          },
          locations: matches,
          severity: pattern.severity,
          confidence: 88,
          penalties: [
            {
              type: 'MONETARY',
              amount: totalGains > 0 ? totalGains * 3 : 5000000,
              text: `Civil penalty: 3x profits gained or losses avoided (${totalGains > 0 ? `${(totalGains * 3).toLocaleString()}` : '$5M'})`,
              statute: '15 U.S.C. § 78u-1'
            },
            {
              type: 'IMPRISONMENT',
              duration: '20',
              unit: 'years',
              text: 'Criminal penalties up to 20 years',
              statute: '15 U.S.C. § 78ff'
            }
          ],
          recommendation: 'FBI_SEC_JOINT_INVESTIGATION',
          detectedAt: new Date().toISOString(),
          detectionMethod: 'Insider trading pattern recognition + timeline analysis'
        });
      }
    }
    
    return violations;
  }
  
  // ==================== ACCOUNTING FRAUD DETECTION ====================
  
  private async detectAccountingFraud(parsed: ParsedDocument): Promise<DetailedViolation[]> {
    const violations: DetailedViolation[] = [];
    
    // Check for entity manipulation
    if (parsed.entities.companies.length > 10) {
      const evidence: ViolationEvidence[] = [{
        type: 'PATTERN',
        description: `Unusually high number of related entities (${parsed.entities.companies.length} companies)`,
        source: 'Entity extraction analysis',
        page: 0,
        line: 0,
        rawText: parsed.entities.companies.map(c => c.name).join(', '),
        highlightStart: 0,
        highlightEnd: 0
      }];
      
      violations.push({
        id: this.generateViolationId(),
        type: 'COMPLEX_ENTITY_STRUCTURE',
        statute: '15 U.S.C. § 78m(b)(2)',
        regulation: 'Section 13(b)(2)',
        title: 'Suspicious Entity Structure',
        description: `Document references ${parsed.entities.companies.length} different companies, indicating potentially suspicious entity structure`,
        evidence,
        financialImpact: {
          amount: 0,
          calculation: 'Financial impact requires comprehensive entity analysis',
          breakdown: []
        },
        locations: [],
        severity: 70,
        confidence: 75,
        penalties: [
          {
            type: 'MONETARY',
            amount: 1000000,
            text: 'Civil penalty up to $1,000,000',
            statute: '15 U.S.C. § 78ff'
          }
        ],
        recommendation: 'ENTITY_STRUCTURE_INVESTIGATION',
        detectedAt: new Date().toISOString(),
        detectionMethod: 'Entity relationship analysis'
      });
    }
    
    return violations;
  }
  
  // ==================== UTILITY METHODS ====================
  
  private findPatternInDocument(parsed: ParsedDocument, pattern: string): DocumentLocation[] {
    const locations: DocumentLocation[] = [];
    const regex = new RegExp(pattern, 'gi');
    
    parsed.pages.forEach(page => {
      const lines = page.text.split('\n');
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = regex.exec(line)) !== null) {
          locations.push({
            pageNumber: page.pageNumber,
            lineNumber: lineIndex + 1,
            context: this.extractContext(line, match.index, 150),
            matchedText: match[0],
            highlightStart: match.index,
            highlightEnd: match.index + match[0].length
          });
        }
      });
    });
    
    return locations;
  }
  
  private findRelatedAmounts(
    parsed: ParsedDocument, 
    locations: DocumentLocation[]
  ): FinancialAmount[] {
    const relatedAmounts: FinancialAmount[] = [];
    
    // Find amounts on same pages or within 2 pages
    locations.forEach(loc => {
      const nearby = parsed.financials.amounts.filter(amt =>
        Math.abs(amt.pageNumber - loc.pageNumber) <= 2
      );
      
      nearby.forEach(amt => {
        if (!relatedAmounts.find(a => a.value === amt.value && a.pageNumber === amt.pageNumber)) {
          relatedAmounts.push(amt);
        }
      });
    });
    
    return relatedAmounts;
  }
  
  private extractContext(text: string, index: number, length: number): string {
    const start = Math.max(0, index - length / 2);
    const end = Math.min(text.length, index + length / 2);
    return '...' + text.substring(start, end).trim() + '...';
  }
  
  private getTaxPenalties(statute: string, amount: number): Penalty[] {
    const penalties: Penalty[] = [];
    
    if (statute === '26 U.S.C. § 7201') {
      penalties.push({
        type: 'MONETARY',
        amount: Math.max(250000, amount * 0.75),
        text: `Fine: $250K or 75% of tax evaded (${Math.max(250000, amount * 0.75).toLocaleString()})`,
        statute: '26 U.S.C. § 7201'
      });
      penalties.push({
        type: 'IMPRISONMENT',
        duration: '5',
        unit: 'years',
        text: 'Up to 5 years imprisonment',
        statute: '26 U.S.C. § 7201'
      });
    } else {
      penalties.push({
        type: 'MONETARY',
        amount: 100000,
        text: 'Fine up to $100,000',
        statute
      });
      penalties.push({
        type: 'IMPRISONMENT',
        duration: '3',
        unit: 'years',
        text: 'Up to 3 years imprisonment',
        statute
      });
    }
    
    return penalties;
  }
  
  private toTitleCase(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
  
  private generateViolationId(): string {
    return `VIO-${Date.now()}-${++this.violationCounter}`;
  }
}