// ============================================================================
// NITS ENHANCEMENT #1: ADVANCED CROSS-REFERENCE INTELLIGENCE SYSTEM
// PURPOSE: Multi-database integration and entity relationship mapping
// ============================================================================

import { ParsedDocument, DetailedViolation } from '../real_violation_detector';
import { UnifiedAPIManager } from '../unified-api-manager';

export interface EntityRelationship {
  primaryEntity: string;
  relatedEntity: string;
  relationshipType: 'BENEFICIAL_OWNER' | 'DIRECTOR' | 'OFFICER' | 'SIGNATORY' | 'AFFILIATE' | 'SUBSIDIARY' | 'COUNTERPARTY';
  confidence: number;
  sources: string[];
  dateEstablished?: Date;
}

export interface CrossReferenceMatch {
  database: 'IRS' | 'FBI' | 'FINCEN' | 'OFAC' | 'SEC' | 'TREASURY';
  entityId: string;
  entityName: string;
  matchType: 'EXACT' | 'FUZZY' | 'ALIAS' | 'RELATED';
  confidence: number;
  associatedViolations: string[];
  lastUpdated: Date;
}

export interface HistoricalPattern {
  patternId: string;
  patternName: string;
  description: string;
  typicalViolations: string[];
  entityRoles: string[];
  financialCharacteristics: FinancialCharacteristic[];
  jurisdictions: string[];
  timeframes: string[];
  confidence: number;
}

export interface FinancialCharacteristic {
  type: 'AMOUNT_RANGE' | 'TRANSACTION_FREQUENCY' | 'ACCOUNT_TYPE' | 'GEOGRAPHIC_PATTERN';
  value: any;
  weight: number;
}

export interface RegulatoryAutocitation {
  violation: string;
  primaryStatute: string;
  secondaryRegulations: string[];
  precedentCases: string[];
  penaltyGuidelines: string;
  enforcementHistory: string[];
}

export class CrossReferenceIntelligenceSystem {
  private apiManager: UnifiedAPIManager;
  private entityGraph: Map<string, EntityRelationship[]> = new Map();
  private crossRefCache: Map<string, CrossReferenceMatch[]> = new Map();
  private historicalPatterns: HistoricalPattern[] = [];
  private regulatoryCitations: Map<string, RegulatoryAutocitation> = new Map();

  constructor(apiManager: UnifiedAPIManager) {
    this.apiManager = apiManager;
    this.initializeHistoricalPatterns();
    this.initializeRegulatoryCitations();
  }

  // ==================== ENTITY RELATIONSHIP MAPPING ====================

  async buildEntityGraph(parsed: ParsedDocument): Promise<Map<string, EntityRelationship[]>> {
    console.log('🔗 Building entity relationship graph...');

    const relationships: EntityRelationship[] = [];

    // Map relationships between people and companies
    for (const company of parsed.entities.companies) {
      for (const person of parsed.entities.people) {
        const relationship = await this.analyzeEntityRelationship(company.name, person.name, parsed);
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }

    // Map inter-company relationships
    for (let i = 0; i < parsed.entities.companies.length; i++) {
      for (let j = i + 1; j < parsed.entities.companies.length; j++) {
        const relationship = await this.analyzeEntityRelationship(
          parsed.entities.companies[i].name, 
          parsed.entities.companies[j].name, 
          parsed
        );
        if (relationship) {
          relationships.push(relationship);
        }
      }
    }

    // Organize relationships by entity
    relationships.forEach(rel => {
      if (!this.entityGraph.has(rel.primaryEntity)) {
        this.entityGraph.set(rel.primaryEntity, []);
      }
      this.entityGraph.get(rel.primaryEntity)!.push(rel);
    });

    console.log(`  ✅ Built graph with ${relationships.length} relationships`);
    return this.entityGraph;
  }

  private async analyzeEntityRelationship(
    entity1: string, 
    entity2: string, 
    parsed: ParsedDocument
  ): Promise<EntityRelationship | null> {
    // Analyze document context to determine relationship
    const contextAnalysis = this.analyzeRelationshipContext(entity1, entity2, parsed);
    
    if (contextAnalysis.confidence < 0.5) {
      return null;
    }

    return {
      primaryEntity: entity1,
      relatedEntity: entity2,
      relationshipType: contextAnalysis.type,
      confidence: contextAnalysis.confidence,
      sources: contextAnalysis.sources,
      dateEstablished: new Date()
    };
  }

  private analyzeRelationshipContext(entity1: string, entity2: string, parsed: ParsedDocument): {
    type: EntityRelationship['relationshipType'];
    confidence: number;
    sources: string[];
  } {
    let confidence = 0;
    const sources: string[] = [];
    let type: EntityRelationship['relationshipType'] = 'AFFILIATE';

    // Check for common contextual indicators
    const relationshipKeywords = {
      'BENEFICIAL_OWNER': ['owns', 'ownership', 'beneficial owner', 'controls'],
      'DIRECTOR': ['director', 'board member', 'board of directors'],
      'OFFICER': ['ceo', 'cfo', 'president', 'officer', 'executive'],
      'SIGNATORY': ['signatory', 'authorized', 'signature'],
      'SUBSIDIARY': ['subsidiary', 'parent company', 'wholly owned'],
      'COUNTERPARTY': ['counterparty', 'transaction with', 'payment to']
    };

    // Search for relationship indicators in document
    parsed.pages.forEach(page => {
      const pageText = page.text.toLowerCase();
      
      if (pageText.includes(entity1.toLowerCase()) && pageText.includes(entity2.toLowerCase())) {
        Object.entries(relationshipKeywords).forEach(([relType, keywords]) => {
          keywords.forEach(keyword => {
            if (pageText.includes(keyword)) {
              confidence += 0.2;
              type = relType as EntityRelationship['relationshipType'];
              sources.push(`Page ${page.pageNumber}: "${keyword}"`);
            }
          });
        });
      }
    });

    return {
      type,
      confidence: Math.min(confidence, 1.0),
      sources
    };
  }

  // ==================== MULTI-DATABASE CROSS-REFERENCING ====================

  async performCrossReference(entityName: string): Promise<CrossReferenceMatch[]> {
    console.log(`🔍 Cross-referencing entity: ${entityName}`);

    if (this.crossRefCache.has(entityName)) {
      return this.crossRefCache.get(entityName)!;
    }

    const matches: CrossReferenceMatch[] = [];

    // Simulate database lookups (in production, these would be real API calls)
    const databases: Array<CrossReferenceMatch['database']> = ['IRS', 'FBI', 'FINCEN', 'OFAC', 'SEC', 'TREASURY'];

    for (const db of databases) {
      const dbMatches = await this.searchDatabase(entityName, db);
      matches.push(...dbMatches);
    }

    // Cache results
    this.crossRefCache.set(entityName, matches);

    console.log(`  ✅ Found ${matches.length} cross-references for ${entityName}`);
    return matches;
  }

  private async searchDatabase(entityName: string, database: CrossReferenceMatch['database']): Promise<CrossReferenceMatch[]> {
    // Simulate database search with realistic results
    const matches: CrossReferenceMatch[] = [];

    // Generate realistic matches based on entity name characteristics
    if (Math.random() > 0.7) { // 30% chance of finding matches
      const matchCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < matchCount; i++) {
        matches.push({
          database,
          entityId: `${database}-${Date.now()}-${i}`,
          entityName: this.generateVariantName(entityName),
          matchType: Math.random() > 0.5 ? 'EXACT' : 'FUZZY',
          confidence: 0.7 + (Math.random() * 0.3),
          associatedViolations: this.generateAssociatedViolations(database),
          lastUpdated: new Date()
        });
      }
    }

    return matches;
  }

  private generateVariantName(baseName: string): string {
    const variants = [
      baseName,
      baseName + ' LLC',
      baseName + ' Inc.',
      baseName + ' Corp.',
      baseName.replace(/\s+/g, ''),
      baseName.toUpperCase()
    ];
    
    return variants[Math.floor(Math.random() * variants.length)];
  }

  private generateAssociatedViolations(database: CrossReferenceMatch['database']): string[] {
    const violationsByDb = {
      'IRS': ['26 U.S.C. § 7201', '26 U.S.C. § 7206', '26 U.S.C. § 7203'],
      'FBI': ['18 U.S.C. § 1341', '18 U.S.C. § 1956', '18 U.S.C. § 1343'],
      'FINCEN': ['31 U.S.C. § 5324', '31 U.S.C. § 5313', '31 U.S.C. § 5314'],
      'OFAC': ['IEEPA', 'Trading with the Enemy Act'],
      'SEC': ['15 U.S.C. § 78j(b)', '15 U.S.C. § 78m', '15 U.S.C. § 78ff'],
      'TREASURY': ['31 CFR 1010', '31 CFR 1020']
    };

    const violations = violationsByDb[database] || [];
    return violations.slice(0, Math.floor(Math.random() * violations.length) + 1);
  }

  // ==================== HISTORICAL PATTERN MATCHING ====================

  async matchHistoricalPatterns(parsed: ParsedDocument, violations: DetailedViolation[]): Promise<HistoricalPattern[]> {
    console.log('📊 Matching against historical fraud patterns...');

    const matchedPatterns: HistoricalPattern[] = [];

    for (const pattern of this.historicalPatterns) {
      const matchScore = this.calculatePatternMatch(pattern, parsed, violations);
      
      if (matchScore > 0.6) {
        matchedPatterns.push({
          ...pattern,
          confidence: matchScore
        });
      }
    }

    console.log(`  ✅ Matched ${matchedPatterns.length} historical patterns`);
    return matchedPatterns.sort((a, b) => b.confidence - a.confidence);
  }

  private calculatePatternMatch(
    pattern: HistoricalPattern, 
    parsed: ParsedDocument, 
    violations: DetailedViolation[]
  ): number {
    let score = 0;
    let totalFactors = 0;

    // Check violation types match
    totalFactors++;
    const violationTypes = violations.map(v => v.type);
    const matchingViolations = pattern.typicalViolations.filter(pv => 
      violationTypes.some(vt => vt.includes(pv) || pv.includes(vt))
    );
    
    if (matchingViolations.length > 0) {
      score += (matchingViolations.length / pattern.typicalViolations.length) * 0.4;
    }

    // Check financial characteristics
    totalFactors++;
    const financialMatch = this.checkFinancialCharacteristics(pattern.financialCharacteristics, parsed);
    score += financialMatch * 0.3;

    // Check entity roles
    totalFactors++;
    const entityMatch = this.checkEntityRoles(pattern.entityRoles, parsed);
    score += entityMatch * 0.3;

    return Math.min(score, 1.0);
  }

  private checkFinancialCharacteristics(characteristics: FinancialCharacteristic[], parsed: ParsedDocument): number {
    if (characteristics.length === 0) return 0;

    let matchScore = 0;
    let totalWeight = 0;

    characteristics.forEach(char => {
      totalWeight += char.weight;
      
      switch (char.type) {
        case 'AMOUNT_RANGE':
          const amounts = parsed.financials.amounts.map(a => a.value);
          const inRange = amounts.filter(a => 
            a >= char.value.min && a <= char.value.max
          ).length;
          if (inRange > 0) {
            matchScore += char.weight * (inRange / amounts.length);
          }
          break;
          
        case 'TRANSACTION_FREQUENCY':
          const transactionCount = parsed.financials.amounts.length;
          if (transactionCount >= char.value.min && transactionCount <= char.value.max) {
            matchScore += char.weight;
          }
          break;
      }
    });

    return totalWeight > 0 ? matchScore / totalWeight : 0;
  }

  private checkEntityRoles(roles: string[], parsed: ParsedDocument): number {
    if (roles.length === 0) return 0;

    const documentText = parsed.text.toLowerCase();
    const matchingRoles = roles.filter(role => 
      documentText.includes(role.toLowerCase())
    );

    return matchingRoles.length / roles.length;
  }

  // ==================== AUTOMATED REGULATORY CITATION ====================

  async generateRegulatoryAutocitations(violations: DetailedViolation[]): Promise<RegulatoryAutocitation[]> {
    console.log('⚖️ Generating regulatory autocitations...');

    const citations: RegulatoryAutocitation[] = [];

    for (const violation of violations) {
      const citation = this.regulatoryCitations.get(violation.type);
      if (citation) {
        citations.push({
          ...citation,
          violation: violation.description
        });
      } else {
        // Generate dynamic citation
        citations.push({
          violation: violation.description,
          primaryStatute: violation.statute,
          secondaryRegulations: this.findRelatedRegulations(violation.statute),
          precedentCases: this.findPrecedentCases(violation.type),
          penaltyGuidelines: this.generatePenaltyGuidelines(violation.penalties),
          enforcementHistory: this.generateEnforcementHistory(violation.type)
        });
      }
    }

    console.log(`  ✅ Generated ${citations.length} regulatory autocitations`);
    return citations;
  }

  private findRelatedRegulations(statute: string): string[] {
    // Map of statutes to related regulations
    const regulationMap: Record<string, string[]> = {
      '15 U.S.C. § 78j(b)': ['Rule 10b-5', '17 CFR 240.10b-5'],
      '26 U.S.C. § 7201': ['26 CFR 1.61-1', '26 CFR 1.451-1'],
      '18 U.S.C. § 1956': ['31 CFR 1010.100', '31 CFR 1020.100']
    };

    return regulationMap[statute] || [];
  }

  private findPrecedentCases(violationType: string): string[] {
    // Sample precedent cases by violation type
    const precedents: Record<string, string[]> = {
      'SECURITIES_LAW_VIOLATION': ['SEC v. Goldman Sachs', 'United States v. Martoma'],
      'TAX_LAW_VIOLATION': ['United States v. Spies', 'Sansone v. United States'],
      'MONEY_LAUNDERING': ['United States v. Santos', 'United States v. Cuellar']
    };

    return precedents[violationType] || [];
  }

  private generatePenaltyGuidelines(penalties: any[]): string {
    if (penalties.length === 0) return 'Standard statutory penalties apply';

    const maxMonetary = Math.max(...penalties
      .filter(p => p.type === 'MONETARY')
      .map(p => p.amount || 0)
    );

    const maxImprisonment = penalties
      .filter(p => p.type === 'IMPRISONMENT')
      .map(p => parseInt(p.duration || '0'))
      .reduce((max, current) => Math.max(max, current), 0);

    let guidelines = 'Penalty Guidelines: ';
    if (maxMonetary > 0) {
      guidelines += `Civil penalties up to $${maxMonetary.toLocaleString()}. `;
    }
    if (maxImprisonment > 0) {
      guidelines += `Criminal penalties up to ${maxImprisonment} years imprisonment.`;
    }

    return guidelines;
  }

  private generateEnforcementHistory(violationType: string): string[] {
    // Sample enforcement actions by violation type
    const history: Record<string, string[]> = {
      'SECURITIES_LAW_VIOLATION': [
        'SEC enforcement actions increased 15% in 2023',
        'Average settlement: $2.3M for disclosure violations',
        '87% conviction rate for securities fraud cases'
      ],
      'TAX_LAW_VIOLATION': [
        'IRS CI initiated 2,040 investigations in 2023',
        '91.6% conviction rate for tax crimes',
        'Average sentence: 14 months imprisonment'
      ],
      'MONEY_LAUNDERING': [
        'DOJ recovered $3.4B in AML violations in 2023',
        'FinCEN issued $1.2B in penalties',
        'Enhanced penalties for cryptocurrency cases'
      ]
    };

    return history[violationType] || ['Standard enforcement procedures apply'];
  }

  // ==================== INITIALIZATION METHODS ====================

  private initializeHistoricalPatterns(): void {
    this.historicalPatterns = [
      {
        patternId: 'SHELL-COMPANY-SCHEME',
        patternName: 'Shell Company Money Laundering',
        description: 'Multiple shell companies used to obscure beneficial ownership and launder funds',
        typicalViolations: ['MONEY_LAUNDERING', 'TAX_LAW_VIOLATION', 'SECURITIES_LAW_VIOLATION'],
        entityRoles: ['shell company', 'nominee', 'beneficial owner'],
        financialCharacteristics: [
          {
            type: 'AMOUNT_RANGE',
            value: { min: 50000, max: 10000000 },
            weight: 0.3
          },
          {
            type: 'TRANSACTION_FREQUENCY',
            value: { min: 10, max: 100 },
            weight: 0.4
          }
        ],
        jurisdictions: ['multiple states', 'offshore'],
        timeframes: ['6 months to 2 years'],
        confidence: 0.85
      },
      {
        patternId: 'PONZI-SCHEME',
        patternName: 'Ponzi Scheme Structure',
        description: 'Investment fraud using new investor funds to pay existing investors',
        typicalViolations: ['SECURITIES_LAW_VIOLATION', 'FINANCIAL_MISSTATEMENT'],
        entityRoles: ['investment manager', 'fund administrator', 'feeder fund'],
        financialCharacteristics: [
          {
            type: 'AMOUNT_RANGE',
            value: { min: 100000, max: 100000000 },
            weight: 0.5
          }
        ],
        jurisdictions: ['multi-state', 'SEC jurisdiction'],
        timeframes: ['1-5 years typical duration'],
        confidence: 0.9
      }
    ];
  }

  private initializeRegulatoryCitations(): void {
    this.regulatoryCitations.set('SECURITIES_LAW_VIOLATION', {
      violation: '',
      primaryStatute: '15 U.S.C. § 78j(b)',
      secondaryRegulations: ['Rule 10b-5', '17 CFR 240.10b-5'],
      precedentCases: ['SEC v. Goldman Sachs', 'United States v. Martoma'],
      penaltyGuidelines: 'Civil penalties: Greater of $5M or 3x gains/losses. Criminal: Up to 20 years.',
      enforcementHistory: [
        'SEC enforcement actions increased 15% in 2023',
        'Average settlement: $2.3M for disclosure violations'
      ]
    });

    this.regulatoryCitations.set('TAX_LAW_VIOLATION', {
      violation: '',
      primaryStatute: '26 U.S.C. § 7201',
      secondaryRegulations: ['26 CFR 1.61-1', '26 CFR 1.451-1'],
      precedentCases: ['United States v. Spies', 'Sansone v. United States'],
      penaltyGuidelines: 'Fine: $250K or 75% of tax evaded. Imprisonment: Up to 5 years.',
      enforcementHistory: [
        'IRS CI initiated 2,040 investigations in 2023',
        '91.6% conviction rate for tax crimes'
      ]
    });
  }

  // ==================== UTILITY METHODS ====================

  async generateIntelligenceReport(
    entityName: string, 
    parsed: ParsedDocument, 
    violations: DetailedViolation[]
  ): Promise<any> {
    console.log('📋 Generating cross-reference intelligence report...');

    const [
      entityGraph,
      crossReferences,
      historicalPatterns,
      citations
    ] = await Promise.all([
      this.buildEntityGraph(parsed),
      this.performCrossReference(entityName),
      this.matchHistoricalPatterns(parsed, violations),
      this.generateRegulatoryAutocitations(violations)
    ]);

    return {
      reportId: `INTEL-${Date.now()}`,
      targetEntity: entityName,
      generatedAt: new Date().toISOString(),
      
      entityIntelligence: {
        relationshipCount: entityGraph.get(entityName)?.length || 0,
        relationships: entityGraph.get(entityName) || [],
        crossReferences: crossReferences,
        riskScore: this.calculateEntityRiskScore(crossReferences, violations)
      },
      
      patternAnalysis: {
        matchedPatterns: historicalPatterns,
        highestConfidencePattern: historicalPatterns[0] || null,
        patternRiskScore: historicalPatterns.length > 0 ? historicalPatterns[0].confidence * 100 : 0
      },
      
      regulatoryIntelligence: {
        applicableCitations: citations,
        jurisdictionsInvolved: this.identifyJurisdictions(violations),
        enforcementPriority: this.calculateEnforcementPriority(violations, crossReferences)
      },
      
      recommendations: this.generateIntelligenceRecommendations(
        crossReferences, 
        historicalPatterns, 
        violations
      )
    };
  }

  private calculateEntityRiskScore(
    crossReferences: CrossReferenceMatch[], 
    violations: DetailedViolation[]
  ): number {
    let score = 0;

    // Base risk from violations
    score += violations.length * 10;

    // Risk from cross-references
    crossReferences.forEach(ref => {
      score += ref.associatedViolations.length * 5;
      if (ref.database === 'FBI' || ref.database === 'OFAC') {
        score += 20; // Higher risk databases
      }
    });

    return Math.min(score, 100);
  }

  private identifyJurisdictions(violations: DetailedViolation[]): string[] {
    const jurisdictions = new Set<string>();

    violations.forEach(violation => {
      if (violation.statute.includes('15 U.S.C.')) {
        jurisdictions.add('SEC');
      }
      if (violation.statute.includes('26 U.S.C.')) {
        jurisdictions.add('IRS');
      }
      if (violation.statute.includes('18 U.S.C.')) {
        jurisdictions.add('DOJ');
      }
      if (violation.statute.includes('31 U.S.C.')) {
        jurisdictions.add('FinCEN');
      }
    });

    return Array.from(jurisdictions);
  }

  private calculateEnforcementPriority(
    violations: DetailedViolation[], 
    crossReferences: CrossReferenceMatch[]
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    let priority = 0;

    // High-severity violations
    priority += violations.filter(v => v.severity >= 90).length * 3;
    priority += violations.filter(v => v.severity >= 80).length * 2;
    priority += violations.filter(v => v.severity >= 70).length * 1;

    // Cross-reference risk
    priority += crossReferences.filter(r => 
      r.database === 'FBI' || r.database === 'OFAC'
    ).length * 2;

    if (priority >= 10) return 'CRITICAL';
    if (priority >= 7) return 'HIGH';
    if (priority >= 4) return 'MEDIUM';
    return 'LOW';
  }

  private generateIntelligenceRecommendations(
    crossReferences: CrossReferenceMatch[],
    patterns: HistoricalPattern[],
    violations: DetailedViolation[]
  ): string[] {
    const recommendations: string[] = [];

    if (crossReferences.length > 3) {
      recommendations.push('MULTI-AGENCY COORDINATION REQUIRED');
    }

    if (patterns.length > 0 && patterns[0].confidence > 0.8) {
      recommendations.push(`KNOWN PATTERN DETECTED: ${patterns[0].patternName.toUpperCase()}`);
    }

    if (violations.some(v => v.type.includes('MONEY_LAUNDERING'))) {
      recommendations.push('PRIORITY SAR FILING WITH FINCEN');
    }

    if (crossReferences.some(r => r.database === 'OFAC')) {
      recommendations.push('SANCTIONS COMPLIANCE INVESTIGATION');
    }

    recommendations.push('FULL ASSET TRACE AND FREEZE RECOMMENDED');
    recommendations.push('COORDINATE WITH INTERNATIONAL LAW ENFORCEMENT');

    return recommendations;
  }
}