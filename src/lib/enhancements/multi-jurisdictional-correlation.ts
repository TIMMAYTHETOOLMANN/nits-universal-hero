// ============================================================================
// NITS ENHANCEMENT #2: MULTI-JURISDICTIONAL VIOLATION CORRELATION ENGINE
// PURPOSE: Identify violations spanning multiple jurisdictions
// ============================================================================

import { ParsedDocument, DetailedViolation } from '../real_violation_detector';

export interface JurisdictionMapping {
  primary: string;
  secondary: string[];
  triggers: string[];
  authorities: string[];
}

export interface CrossJurisdictionalViolation {
  violationId: string;
  jurisdictions: string[];
  nexusPoints: string[];
  authorities: string[];
  severity: number;
  coordination: string[];
}

export class MultiJurisdictionalCorrelationEngine {
  private jurisdictionMaps: Map<string, JurisdictionMapping> = new Map();

  constructor() {
    this.initializeJurisdictionMaps();
  }

  async correlateJurisdictions(
    parsed: ParsedDocument, 
    violations: DetailedViolation[]
  ): Promise<CrossJurisdictionalViolation[]> {
    console.log('🌐 Analyzing multi-jurisdictional violations...');

    const crossJurisdictional: CrossJurisdictionalViolation[] = [];

    for (const violation of violations) {
      const jurisdictions = this.identifyJurisdictions(violation, parsed);
      
      if (jurisdictions.length > 1) {
        crossJurisdictional.push({
          violationId: violation.id,
          jurisdictions,
          nexusPoints: this.identifyNexusPoints(violation, parsed),
          authorities: this.getRelevantAuthorities(jurisdictions),
          severity: this.calculateCrossJurisdictionalSeverity(violation, jurisdictions),
          coordination: this.generateCoordinationPlan(jurisdictions)
        });
      }
    }

    console.log(`  ✅ Found ${crossJurisdictional.length} multi-jurisdictional violations`);
    return crossJurisdictional;
  }

  private identifyJurisdictions(violation: DetailedViolation, parsed: ParsedDocument): string[] {
    const jurisdictions = new Set<string>();

    // Federal jurisdiction indicators
    if (violation.statute.includes('15 U.S.C.')) jurisdictions.add('SEC');
    if (violation.statute.includes('26 U.S.C.')) jurisdictions.add('IRS');
    if (violation.statute.includes('18 U.S.C.')) jurisdictions.add('DOJ');
    if (violation.statute.includes('31 U.S.C.')) jurisdictions.add('FinCEN');

    // Interstate commerce indicators
    if (this.hasInterstateNexus(parsed)) {
      jurisdictions.add('INTERSTATE');
    }

    // International indicators
    if (this.hasInternationalNexus(parsed)) {
      jurisdictions.add('INTERNATIONAL');
    }

    return Array.from(jurisdictions);
  }

  private hasInterstateNexus(parsed: ParsedDocument): boolean {
    const text = parsed.text.toLowerCase();
    return text.includes('wire transfer') || 
           text.includes('interstate') || 
           text.includes('multi-state') ||
           parsed.entities.companies.length > 1;
  }

  private hasInternationalNexus(parsed: ParsedDocument): boolean {
    const text = parsed.text.toLowerCase();
    return text.includes('offshore') || 
           text.includes('foreign') || 
           text.includes('international') ||
           text.includes('cayman') ||
           text.includes('switzerland');
  }

  private identifyNexusPoints(violation: DetailedViolation, parsed: ParsedDocument): string[] {
    const nexusPoints: string[] = [];

    // Financial nexus points
    if (parsed.financials.amounts.some(a => a.value > 1000000)) {
      nexusPoints.push('HIGH_VALUE_TRANSACTIONS');
    }

    // Entity nexus points
    if (parsed.entities.companies.length > 3) {
      nexusPoints.push('COMPLEX_ENTITY_STRUCTURE');
    }

    // Geographic nexus points
    if (this.hasInterstateNexus(parsed)) {
      nexusPoints.push('INTERSTATE_COMMERCE');
    }

    return nexusPoints;
  }

  private getRelevantAuthorities(jurisdictions: string[]): string[] {
    const authorities: string[] = [];
    
    jurisdictions.forEach(jurisdiction => {
      const mapping = this.jurisdictionMaps.get(jurisdiction);
      if (mapping) {
        authorities.push(...mapping.authorities);
      }
    });

    return [...new Set(authorities)];
  }

  private calculateCrossJurisdictionalSeverity(
    violation: DetailedViolation, 
    jurisdictions: string[]
  ): number {
    let severity = violation.severity;
    
    // Increase severity for multiple jurisdictions
    severity += jurisdictions.length * 10;
    
    // Bonus for international nexus
    if (jurisdictions.includes('INTERNATIONAL')) {
      severity += 20;
    }

    return Math.min(severity, 100);
  }

  private generateCoordinationPlan(jurisdictions: string[]): string[] {
    const plan: string[] = [];

    if (jurisdictions.includes('SEC') && jurisdictions.includes('DOJ')) {
      plan.push('SEC-DOJ PARALLEL PROCEEDINGS');
    }

    if (jurisdictions.includes('IRS') && jurisdictions.includes('DOJ')) {
      plan.push('TAX-CRIMINAL COORDINATION');
    }

    if (jurisdictions.includes('INTERNATIONAL')) {
      plan.push('MUTUAL_LEGAL_ASSISTANCE_TREATY');
      plan.push('INTERPOL_COORDINATION');
    }

    return plan;
  }

  private initializeJurisdictionMaps(): void {
    this.jurisdictionMaps.set('SEC', {
      primary: 'Securities and Exchange Commission',
      secondary: ['DOJ', 'FINRA', 'CFTC'],
      triggers: ['securities fraud', 'market manipulation', 'insider trading'],
      authorities: ['SEC', 'DOJ Criminal Division', 'FBI']
    });

    this.jurisdictionMaps.set('IRS', {
      primary: 'Internal Revenue Service',
      secondary: ['DOJ Tax Division', 'Treasury'],
      triggers: ['tax evasion', 'unreported income', 'false returns'],
      authorities: ['IRS Criminal Investigation', 'DOJ Tax Division']
    });

    this.jurisdictionMaps.set('DOJ', {
      primary: 'Department of Justice',
      secondary: ['FBI', 'DEA', 'ATF'],
      triggers: ['wire fraud', 'money laundering', 'conspiracy'],
      authorities: ['FBI', 'DOJ Criminal Division', 'US Attorneys']
    });
  }
}