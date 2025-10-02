// PURPOSE: Central hub for all government data sources
// MANAGES: GovInfo API + SEC EDGAR API + Future expansions

export class UnifiedAPIManager {
  private govInfoKey = 'WI9hQX86aSPojGmSu2C64FYRnBWe71v3EridMBg5';
  private secHeaders = {
    'User-Agent': 'NITS-Terminator legal@nitsforensics.com',
    'Accept-Encoding': 'gzip, deflate',
    'Host': 'data.sec.gov'
  };

  // GovInfo endpoints
  private govInfoBase = 'https://api.govinfo.gov';
  
  // SEC endpoints
  private secEdgarBase = 'https://data.sec.gov';
  private secEdgarFiling = 'https://www.sec.gov/cgi-bin/browse-edgar';

  constructor() {
    console.log('🔴 UNIFIED API MANAGER INITIALIZED');
    console.log('✅ GovInfo API: READY');
    console.log('✅ SEC EDGAR API: READY');
  }

  // ==================== GOVINFO METHODS ====================
  
  async fetchCFRTitle(titleNumber: number): Promise<any> {
    const url = `${this.govInfoBase}/collections/CFR/2025/title-${titleNumber}`;
    const params = new URLSearchParams({ api_key: this.govInfoKey });
    
    try {
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) throw new Error(`GovInfo CFR ${titleNumber} failed`);
      return await response.json();
    } catch (error) {
      console.error(`CFR Title ${titleNumber} fetch error:`, error);
      return null;
    }
  }

  async searchGovInfo(query: string, pageSize: number = 100): Promise<any[]> {
    const params = new URLSearchParams({
      api_key: this.govInfoKey,
      query: query,
      pageSize: pageSize.toString()
    });

    try {
      await this.rateLimit('GOVINFO');
      const response = await fetch(`${this.govInfoBase}/search?${params}`);
      if (!response.ok) throw new Error('GovInfo search failed');
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('GovInfo search error:', error);
      return [];
    }
  }

  // ==================== SEC EDGAR METHODS ====================

  async fetchCompanyFacts(cik: string): Promise<any> {
    // Remove leading zeros and pad to 10 digits
    const paddedCIK = cik.replace(/^0+/, '').padStart(10, '0');
    const url = `${this.secEdgarBase}/api/xbrl/companyfacts/CIK${paddedCIK}.json`;

    try {
      await this.rateLimit('SEC');
      const response = await fetch(url, { headers: this.secHeaders });
      if (!response.ok) throw new Error(`SEC CIK ${cik} fetch failed`);
      return await response.json();
    } catch (error) {
      console.error(`SEC company facts error for CIK ${cik}:`, error);
      return null;
    }
  }

  async fetchCompanySubmissions(cik: string): Promise<any> {
    const paddedCIK = cik.replace(/^0+/, '').padStart(10, '0');
    const url = `${this.secEdgarBase}/submissions/CIK${paddedCIK}.json`;

    try {
      await this.rateLimit('SEC');
      const response = await fetch(url, { headers: this.secHeaders });
      if (!response.ok) throw new Error(`SEC submissions failed`);
      return await response.json();
    } catch (error) {
      console.error(`SEC submissions error:`, error);
      return null;
    }
  }

  async searchCompanyByCIKOrTicker(identifier: string): Promise<any> {
    // First get the company tickers mapping
    const tickersUrl = `${this.secEdgarBase}/files/company_tickers.json`;
    
    try {
      await this.rateLimit('SEC');
      const response = await fetch(tickersUrl, { headers: this.secHeaders });
      if (!response.ok) throw new Error('SEC ticker lookup failed');
      const tickers = await response.json();
      
      // Search for company
      const upperIdentifier = identifier.toUpperCase();
      const company = Object.values(tickers).find((t: any) => 
        t.ticker === upperIdentifier || 
        t.cik_str.toString() === identifier.replace(/^0+/, '')
      );

      return company || null;
    } catch (error) {
      console.error('SEC company search error:', error);
      return null;
    }
  }

  async fetchFilingDocument(accessionNumber: string, filename: string): Promise<string> {
    // Remove dashes from accession number for URL
    const cleanAccession = accessionNumber.replace(/-/g, '');
    const url = `${this.secEdgarBase}/Archives/edgar/data/${cleanAccession}/${filename}`;

    try {
      await this.rateLimit('SEC');
      const response = await fetch(url, { headers: this.secHeaders });
      if (!response.ok) throw new Error('Filing document fetch failed');
      return await response.text();
    } catch (error) {
      console.error('Filing document error:', error);
      return '';
    }
  }

  async fetchEnforcementActions(startDate?: string, endDate?: string): Promise<any[]> {
    // SEC litigation releases
    const litUrl = 'https://www.sec.gov/litigation/litreleases.shtml';
    
    try {
      const response = await fetch(litUrl);
      if (!response.ok) throw new Error('SEC enforcement fetch failed');
      const html = await response.text();
      
      // Parse HTML to extract enforcement actions
      // This would need proper HTML parsing - simplified here
      return this.parseEnforcementHTML(html);
    } catch (error) {
      console.error('SEC enforcement error:', error);
      return [];
    }
  }

  private parseEnforcementHTML(html: string): any[] {
    // Simplified parser - in production, use proper HTML parser
    const actions: any[] = [];
    const pattern = /LR-(\d+)/g;
    let match;
    
    while ((match = pattern.exec(html)) !== null) {
      actions.push({
        releaseNumber: match[1],
        type: 'LITIGATION_RELEASE',
        date: new Date().toISOString()
      });
    }
    
    return actions;
  }

  // ==================== RATE LIMITING ====================

  private lastGovInfoCall = 0;
  private lastSECCall = 0;
  private govInfoDelay = 1000; // 1 second between calls
  private secDelay = 100; // SEC allows 10 requests/second

  async rateLimit(apiType: 'GOVINFO' | 'SEC'): Promise<void> {
    const now = Date.now();
    
    if (apiType === 'GOVINFO') {
      const elapsed = now - this.lastGovInfoCall;
      if (elapsed < this.govInfoDelay) {
        await new Promise(resolve => setTimeout(resolve, this.govInfoDelay - elapsed));
      }
      this.lastGovInfoCall = Date.now();
    } else {
      const elapsed = now - this.lastSECCall;
      if (elapsed < this.secDelay) {
        await new Promise(resolve => setTimeout(resolve, this.secDelay - elapsed));
      }
      this.lastSECCall = Date.now();
    }
  }
}