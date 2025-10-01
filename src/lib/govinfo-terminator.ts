import { GovInfoAPI } from './govinfo-api';

export class TerminatorAnalysisEngine {
  private govAPI: GovInfoAPI;
  private isInitialized: boolean = false;
  
  constructor() {
    this.govAPI = new GovInfoAPI();
  }
  
  async initialize(): Promise<void> {
    console.log('🔴 Initializing Terminator Engine...');
    
    try {
      const essentialTitles = [17, 26]; // Securities and Tax
      
      for (const title of essentialTitles) {
        const data = await this.govAPI.getCFRTitle(title);
        if (data) {
          console.log(`✓ Loaded CFR Title ${title}`);
        }
      }
      
      this.isInitialized = true;
      console.log('✅ Terminator Engine Ready');
    } catch (error) {
      console.error('Initialization failed:', error);
      this.isInitialized = false;
    }
  }
  
  async terminateDocument(file: File): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`🎯 Terminating: ${file.name}`);
    
    const text = await this.extractText(file);
    const violations = await this.detectViolations(text);
    
    return {
      fileName: file.name,
      analyzedAt: new Date(),
      violations: violations.map(v => ({
        statute: v.statute || 'Unknown Statute',
        description: v.description || 'Violation detected',
        severity: Math.min(v.confidence || 50, 100),
        confidence: v.confidence || 50,
        evidence: v.evidence || ['Pattern detected in document']
      })),
      status: 'complete'
    };
  }
  
  private async extractText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.readAsText(file);
    });
  }
  
  private async detectViolations(text: string): Promise<any[]> {
    const violations: any[] = [];
    
    const patterns = [
      { 
        regex: /fraud|misrepresent|deceiv/gi, 
        statute: '15 U.S.C. § 78j(b)',
        description: 'Securities fraud indicators detected',
        severity: 85 
      },
      { 
        regex: /insider.{0,20}trading/gi, 
        statute: '15 U.S.C. § 78u-1',
        description: 'Insider trading pattern detected',
        severity: 90 
      },
      { 
        regex: /non.{0,10}compliance|violation/gi, 
        statute: 'SEC Rule 10b-5',
        description: 'Regulatory compliance violation',
        severity: 70 
      }
    ];
    
    for (const pattern of patterns) {
      const matches = text.match(pattern.regex);
      if (matches) {
        violations.push({
          statute: pattern.statute,
          description: pattern.description,
          confidence: Math.min(matches.length * 15 + pattern.severity, 95),
          evidence: [`Found ${matches.length} instances in document`, 'Pattern analysis complete']
        });
      }
    }
    
    if (violations.length > 0) {
      const searchResults = await this.govAPI.searchDocuments('violation penalty enforcement');
      console.log(`Found ${searchResults.length} related regulations`);
    }
    
    return violations;
  }
}

export async function initializeTerminator(): Promise<TerminatorAnalysisEngine> {
  const engine = new TerminatorAnalysisEngine();
  await engine.initialize();
  return engine;
}