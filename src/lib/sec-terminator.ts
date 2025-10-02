// PURPOSE: SEC filing analysis and securities violation detection
// TARGETS: 10-K, 10-Q, 8-K filings, beneficial ownership, insider trading

import { UnifiedAPIManager } from './unified-api-manager';

export interface SECViolation {
  type: string;
  statute: string;
  regulation?: string;
  description: string;
  evidence: string[];
  severity: number; // 0-100
  confidence: number; // 0-100
  penalties: Penalty[];
  recommendation: string;
  filingImpacted?: string;
  dateDetected: string;
}

export interface Penalty {
  type: 'MONETARY' | 'IMPRISONMENT' | 'LICENSE_REVOCATION' | 'TRADING_SUSPENSION';
  amount?: number;
  duration?: string;
  unit?: string;
  text: string;
}

export class SECTerminator {
  private api: UnifiedAPIManager;
  private violationDatabase: Map<string, SECViolation[]> = new Map();
  
  // SEC violation patterns
  private readonly FRAUD_INDICATORS = [
    'material misstatement',
    'financial restatement',
    'accounting irregularit',
    'internal control deficien',
    'related party transaction',
    'undisclosed',
    'failed to disclose',
    'omitted material fact'
  ];

  private readonly INSIDER_PATTERNS = [
    'beneficial owner',
    'section 16',
    'form 4',
    'form 5',
    'prior to announcement',
    'material non-public information'
  ];

  private readonly MANIPULATION_KEYWORDS = [
    'round-trip transaction',
    'wash sale',
    'matched order',
    'painting the tape',
    'pump and dump',
    'marking the close'
  ];

  constructor(apiManager: UnifiedAPIManager) {
    this.api = apiManager;
    console.log('🔴 SEC TERMINATOR ENGINE INITIALIZED');
  }

  // ==================== COMPANY ANALYSIS ====================

  async terminateCompany(cikOrTicker: string): Promise<{
    company: any;
    violations: SECViolation[];
    riskScore: number;
    prosecutionPackage: any;
  }> {
    console.log(`🎯 TERMINATING COMPANY: ${cikOrTicker}`);

    // Step 1: Identify company
    const company = await this.api.searchCompanyByCIKOrTicker(cikOrTicker);
    if (!company) {
      throw new Error(`Company not found: ${cikOrTicker}`);
    }

    console.log(`✅ Target acquired: ${company.title} (CIK: ${company.cik_str})`);

    // Step 2: Fetch all submissions
    const submissions = await this.api.fetchCompanySubmissions(company.cik_str.toString());
    
    // Step 3: Analyze recent filings
    const violations: SECViolation[] = [];
    
    if (submissions && submissions.filings && submissions.filings.recent) {
      const recentFilings = submissions.filings.recent;
      
      // Analyze each filing type
      for (let i = 0; i < Math.min(recentFilings.form.length, 50); i++) {
        const form = recentFilings.form[i];
        const accessionNumber = recentFilings.accessionNumber[i];
        const filingDate = recentFilings.filingDate[i];
        
        console.log(`📄 Analyzing ${form} filed ${filingDate}`);
        
        // Critical filings get deep analysis
        if (['10-K', '10-Q', '8-K', 'DEF 14A'].includes(form)) {
          const filingViolations = await this.analyzeFilingDeep(
            company.cik_str.toString(),
            accessionNumber,
            form,
            filingDate
          );
          violations.push(...filingViolations);
        }
      }
    }

    // Step 4: Fetch company facts for numerical analysis
    const facts = await this.api.fetchCompanyFacts(company.cik_str.toString());
    if (facts) {
      const financialViolations = this.analyzeFinancialFacts(facts, company);
      violations.push(...financialViolations);
    }

    // Step 5: Calculate risk score
    const riskScore = this.calculateRiskScore(violations);

    // Step 6: Generate prosecution package
    const prosecutionPackage = this.generateSECProsecutionPackage(
      company,
      violations,
      riskScore
    );

    console.log(`🔴 TERMINATION COMPLETE: ${violations.length} violations detected`);
    
    return {
      company,
      violations,
      riskScore,
      prosecutionPackage
    };
  }

  // ==================== FILING ANALYSIS ====================

  private async analyzeFilingDeep(
    cik: string,
    accessionNumber: string,
    formType: string,
    filingDate: string
  ): Promise<SECViolation[]> {
    const violations: SECViolation[] = [];

    try {
      // Construct primary document filename
      const cleanAccession = accessionNumber.replace(/-/g, '');
      const filename = `${cleanAccession}.txt`;
      
      const content = await this.api.fetchFilingDocument(accessionNumber, filename);
      
      if (!content) return violations;

      // Fraud detection
      for (const indicator of this.FRAUD_INDICATORS) {
        const regex = new RegExp(indicator, 'gi');
        const matches = content.match(regex);
        
        if (matches && matches.length > 0) {
          violations.push({
            type: 'SECURITIES_FRAUD_INDICATOR',
            statute: '15 U.S.C. § 78j(b)',
            regulation: 'Rule 10b-5',
            description: `Fraud indicator detected: "${indicator}"`,
            evidence: this.extractEvidenceContext(content, indicator),
            severity: 85,
            confidence: 70 + Math.min(matches.length * 5, 25),
            penalties: [
              { type: 'MONETARY', amount: 5000000, text: 'Up to $5M civil penalty' },
              { type: 'IMPRISONMENT', duration: '20', unit: 'years', text: 'Up to 20 years' }
            ],
            recommendation: 'SEC_ENFORCEMENT_REFERRAL',
            filingImpacted: `${formType} (${accessionNumber})`,
            dateDetected: new Date().toISOString()
          });
        }
      }

      // Market manipulation
      for (const keyword of this.MANIPULATION_KEYWORDS) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          violations.push({
            type: 'MARKET_MANIPULATION',
            statute: '15 U.S.C. § 78i',
            regulation: 'Section 9(a)(2)',
            description: `Market manipulation indicator: "${keyword}"`,
            evidence: this.extractEvidenceContext(content, keyword),
            severity: 95,
            confidence: 80,
            penalties: [
              { type: 'MONETARY', amount: 10000000, text: 'Up to $10M penalty' },
              { type: 'IMPRISONMENT', duration: '25', unit: 'years', text: 'Up to 25 years' },
              { type: 'TRADING_SUSPENSION', text: 'Trading suspension' }
            ],
            recommendation: 'CRIMINAL_PROSECUTION',
            filingImpacted: `${formType} (${accessionNumber})`,
            dateDetected: new Date().toISOString()
          });
        }
      }

    } catch (error) {
      console.error(`Filing analysis error:`, error);
    }

    return violations;
  }

  // ==================== FINANCIAL FACTS ANALYSIS ====================

  private analyzeFinancialFacts(facts: any, company: any): SECViolation[] {
    const violations: SECViolation[] = [];

    try {
      // Analyze revenue trends
      if (facts.facts && facts.facts['us-gaap']) {
        const gaap = facts.facts['us-gaap'];
        
        // Revenue analysis
        if (gaap.Revenues || gaap.RevenueFromContractWithCustomerExcludingAssessedTax) {
          const revenueData = gaap.Revenues || gaap.RevenueFromContractWithCustomerExcludingAssessedTax;
          const revenueViolations = this.analyzeRevenueTrends(revenueData.units.USD, company);
          violations.push(...revenueViolations);
        }

        // Assets analysis
        if (gaap.Assets) {
          const assetViolations = this.analyzeAssetAnomalies(gaap.Assets.units.USD, company);
          violations.push(...assetViolations);
        }
      }
    } catch (error) {
      console.error('Financial facts analysis error:', error);
    }

    return violations;
  }

  private analyzeRevenueTrends(revenueUnits: any[], company: any): SECViolation[] {
    const violations: SECViolation[] = [];

    // Sort by date
    const sorted = revenueUnits.sort((a, b) => 
      new Date(a.end).getTime() - new Date(b.end).getTime()
    );

    // Check for unusual spikes
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].val;
      const curr = sorted[i].val;
      
      if (prev > 0 && curr > 0) {
        const percentChange = ((curr - prev) / prev) * 100;
        
        // Flag extreme growth (>100% QoQ)
        if (percentChange > 100) {
          violations.push({
            type: 'REVENUE_ANOMALY',
            statute: '15 U.S.C. § 78m',
            regulation: 'Section 13(a)',
            description: `Extreme revenue spike detected: ${percentChange.toFixed(1)}% increase`,
            evidence: [
              `Previous period: $${prev.toLocaleString()}`,
              `Current period: $${curr.toLocaleString()}`,
              `Period ending: ${sorted[i].end}`
            ],
            severity: 75,
            confidence: 85,
            penalties: [
              { type: 'MONETARY', amount: 1000000, text: 'Civil penalty up to $1M' }
            ],
            recommendation: 'FINANCIAL_AUDIT_REQUIRED',
            dateDetected: new Date().toISOString()
          });
        }
      }
    }

    return violations;
  }

  private analyzeAssetAnomalies(assetUnits: any[], company: any): SECViolation[] {
    const violations: SECViolation[] = [];
    
    // Check for sudden asset disappearances
    const sorted = assetUnits.sort((a, b) => 
      new Date(a.end).getTime() - new Date(b.end).getTime()
    );

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1].val;
      const curr = sorted[i].val;
      
      if (prev > 0 && curr < prev * 0.7) { // 30% asset loss
        violations.push({
          type: 'ASSET_DISAPPEARANCE',
          statute: '15 U.S.C. § 78m',
          regulation: 'Section 13(b)(2)',
          description: `Significant asset reduction: ${((1 - curr/prev) * 100).toFixed(1)}% decrease`,
          evidence: [
            `Previous assets: $${prev.toLocaleString()}`,
            `Current assets: $${curr.toLocaleString()}`,
            `Missing assets: $${(prev - curr).toLocaleString()}`
          ],
          severity: 80,
          confidence: 90,
          penalties: [
              { type: 'MONETARY', amount: 2000000, text: 'Civil penalty up to $2M' }
          ],
          recommendation: 'FORENSIC_ACCOUNTING_AUDIT',
          dateDetected: new Date().toISOString()
        });
      }
    }

    return violations;
  }

  // ==================== UTILITY METHODS ====================

  private extractEvidenceContext(content: string, keyword: string, contextLength: number = 300): string[] {
    const evidence: string[] = [];
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    
    let index = lowerContent.indexOf(lowerKeyword);
    let count = 0;
    
    while (index !== -1 && count < 3) {
      const start = Math.max(0, index - contextLength/2);
      const end = Math.min(content.length, index + contextLength/2);
      evidence.push('...' + content.substring(start, end) + '...');
      
      index = lowerContent.indexOf(lowerKeyword, index + 1);
      count++;
    }
    
    return evidence;
  }

  private calculateRiskScore(violations: SECViolation[]): number {
    if (violations.length === 0) return 0;
    const totalSeverity = violations.reduce((sum, v) => sum + v.severity, 0);
    return Math.min(100, totalSeverity / violations.length);
  }

  private generateSECProsecutionPackage(company: any, violations: SECViolation[], riskScore: number): any {
    return {
      target: { name: company.title, cik: company.cik_str },
      summary: { totalViolations: violations.length, riskScore },
      violations,
      generatedAt: new Date().toISOString()
    };
  }
}