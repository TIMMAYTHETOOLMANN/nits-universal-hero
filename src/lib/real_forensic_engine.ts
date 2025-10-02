// ============================================================================
// NITS REAL FORENSIC ANALYSIS ENGINE
// PURPOSE: Actually parse, analyze, and detect violations in documents
// ============================================================================

import { UnifiedAPIManager } from './unified-api-manager';

// ==================== DOCUMENT PARSER ====================

interface ParsedDocument {
  text: string;
  pages: DocumentPage[];
  metadata: DocumentMetadata;
  financials: ExtractedFinancials;
  entities: ExtractedEntities;
  timeline: ExtractedTimeline[];
}

interface DocumentPage {
  pageNumber: number;
  text: string;
  tables: ExtractedTable[];
  charts: ChartData[];
}

interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  pageCount: number;
  documentType: string;
  dateCreated?: Date;
  author?: string;
  company?: string;
}

interface ExtractedFinancials {
  amounts: FinancialAmount[];
  accounts: BankAccount[];
  transactions: Transaction[];
  inconsistencies: FinancialInconsistency[];
}

interface FinancialAmount {
  value: number;
  context: string;
  pageNumber: number;
  lineNumber: number;
  category: 'REVENUE' | 'EXPENSE' | 'ASSET' | 'LIABILITY' | 'PAYMENT' | 'REFUND' | 'UNKNOWN';
  suspiciousScore: number;
}

interface Transaction {
  date: Date;
  amount: number;
  from?: string;
  to?: string;
  description: string;
  pageNumber: number;
  flags: string[];
}

interface FinancialInconsistency {
  type: string;
  description: string;
  amounts: number[];
  expected: number;
  actual: number;
  discrepancy: number;
  location: string;
  severity: number;
}

interface ExtractedEntities {
  people: Person[];
  companies: Company[];
  locations: Location[];
  dates: ExtractedDate[];
}

interface Person {
  name: string;
  role?: string;
  mentions: DocumentReference[];
  relationships: string[];
}

interface Company {
  name: string;
  ticker?: string;
  cik?: string;
  mentions: DocumentReference[];
}

interface DocumentReference {
  pageNumber: number;
  lineNumber: number;
  context: string;
}

// ==================== REAL DOCUMENT PARSER ====================

export class RealDocumentParser {
  
  async parseDocument(file: File): Promise<ParsedDocument> {
    console.log(`📄 PARSING: ${file.name}`);
    
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Detect document type
    const isPDF = this.isPDF(uint8Array);
    
    let text: string;
    let pages: DocumentPage[] = [];
    
    if (isPDF) {
      const pdfData = await this.parsePDF(uint8Array);
      text = pdfData.text;
      pages = pdfData.pages;
    } else {
      // Plain text
      const decoder = new TextDecoder('utf-8');
      text = decoder.decode(uint8Array);
      pages = this.splitIntoPages(text);
    }
    
    console.log(`  ✅ Extracted ${text.length} characters across ${pages.length} pages`);
    
    // Extract structured data
    const financials = await this.extractFinancials(text, pages);
    const entities = await this.extractEntities(text, pages);
    const timeline = await this.extractTimeline(text, pages);
    
    return {
      text,
      pages,
      metadata: {
        fileName: file.name,
        fileSize: file.size,
        pageCount: pages.length,
        documentType: this.detectDocumentType(text)
      },
      financials,
      entities,
      timeline
    };
  }
  
  // ==================== PDF PARSING ====================
  
  private isPDF(data: Uint8Array): boolean {
    return data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46;
  }
  
  private async parsePDF(data: Uint8Array): Promise<{ text: string; pages: DocumentPage[] }> {
    // Simple PDF text extraction
    // In production, you'd use pdf.js or similar
    const decoder = new TextDecoder('utf-8', { fatal: false });
    let rawText = decoder.decode(data);
    
    // Extract text between stream objects
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let match;
    let extractedText = '';
    
    while ((match = streamRegex.exec(rawText)) !== null) {
      extractedText += this.cleanPDFText(match[1]);
    }
    
    // If no streams found, try to extract any readable text
    if (!extractedText) {
      extractedText = rawText.replace(/[^\x20-\x7E\n\r\t]/g, '');
    }
    
    const pages = this.splitIntoPages(extractedText);
    
    return {
      text: extractedText,
      pages
    };
  }
  
  private cleanPDFText(text: string): string {
    // Remove PDF commands and clean text
    return text
      .replace(/[^\x20-\x7E\n\r\t]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private splitIntoPages(text: string): DocumentPage[] {
    // Split by form feeds or estimated page length
    const pageBreaks = text.split(/\f|\n{5,}/);
    
    return pageBreaks.map((pageText, index) => ({
      pageNumber: index + 1,
      text: pageText,
      tables: this.extractTables(pageText),
      charts: []
    }));
  }
  
  // ==================== TABLE EXTRACTION ====================
  
  private extractTables(text: string): ExtractedTable[] {
    const tables: ExtractedTable[] = [];
    
    // Look for table-like structures (multiple columns aligned)
    const lines = text.split('\n');
    let currentTable: string[] = [];
    let inTable = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detect table rows (multiple whitespace-separated columns)
      const columns = line.trim().split(/\s{2,}/).filter(c => c.length > 0);
      
      if (columns.length >= 3) {
        inTable = true;
        currentTable.push(line);
      } else if (inTable && line.trim().length === 0) {
        // End of table
        if (currentTable.length >= 3) {
          tables.push(this.parseTable(currentTable));
        }
        currentTable = [];
        inTable = false;
      }
    }
    
    return tables;
  }
  
  private parseTable(lines: string[]): ExtractedTable {
    const rows: string[][] = [];
    
    for (const line of lines) {
      const columns = line.trim().split(/\s{2,}/).filter(c => c.length > 0);
      rows.push(columns);
    }
    
    return {
      headers: rows[0] || [],
      rows: rows.slice(1),
      raw: lines.join('\n')
    };
  }
  
  // ==================== FINANCIAL EXTRACTION ====================
  
  private async extractFinancials(text: string, pages: DocumentPage[]): Promise<ExtractedFinancials> {
    console.log('💰 Extracting financial data...');
    
    const amounts: FinancialAmount[] = [];
    const transactions: Transaction[] = [];
    const inconsistencies: FinancialInconsistency[] = [];
    
    // Extract all monetary amounts
    const moneyRegex = /\$\s*([0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?)/g;
    
    pages.forEach((page) => {
      const lines = page.text.split('\n');
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = moneyRegex.exec(line)) !== null) {
          const value = parseFloat(match[1].replace(/,/g, ''));
          
          amounts.push({
            value,
            context: this.extractContext(line, match.index, 50),
            pageNumber: page.pageNumber,
            lineNumber: lineIndex + 1,
            category: this.categorizeAmount(line),
            suspiciousScore: this.calculateSuspicionScore(value, line)
          });
        }
      });
    });
    
    console.log(`  ✅ Found ${amounts.length} financial amounts`);
    
    // Detect inconsistencies
    inconsistencies.push(...this.detectFinancialInconsistencies(amounts, pages));
    
    return {
      amounts,
      accounts: [],
      transactions,
      inconsistencies
    };
  }
  
  private categorizeAmount(context: string): FinancialAmount['category'] {
    const lower = context.toLowerCase();
    
    if (lower.includes('revenue') || lower.includes('sales') || lower.includes('income')) {
      return 'REVENUE';
    }
    if (lower.includes('expense') || lower.includes('cost') || lower.includes('expenditure')) {
      return 'EXPENSE';
    }
    if (lower.includes('asset') || lower.includes('property')) {
      return 'ASSET';
    }
    if (lower.includes('liability') || lower.includes('debt') || lower.includes('payable')) {
      return 'LIABILITY';
    }
    if (lower.includes('payment') || lower.includes('paid')) {
      return 'PAYMENT';
    }
    if (lower.includes('refund') || lower.includes('reimbursement')) {
      return 'REFUND';
    }
    
    return 'UNKNOWN';
  }
  
  private calculateSuspicionScore(amount: number, context: string): number {
    let score = 0;
    
    // Round number suspicion (Benford's Law violation)
    if (amount % 1000 === 0 && amount >= 10000) score += 30;
    if (amount % 100 === 0 && amount >= 1000) score += 15;
    
    // Unusually large amounts
    if (amount > 1000000) score += 20;
    if (amount > 10000000) score += 40;
    
    // Suspicious context
    const lower = context.toLowerCase();
    if (lower.includes('cash') || lower.includes('wire transfer')) score += 15;
    if (lower.includes('offshore') || lower.includes('foreign')) score += 25;
    if (lower.includes('consulting fee') || lower.includes('advisory')) score += 20;
    
    return Math.min(100, score);
  }
  
  private detectFinancialInconsistencies(amounts: FinancialAmount[], pages: DocumentPage[]): FinancialInconsistency[] {
    const inconsistencies: FinancialInconsistency[] = [];
    
    // Group by category
    const byCategory = amounts.reduce((acc, amt) => {
      if (!acc[amt.category]) acc[amt.category] = [];
      acc[amt.category].push(amt);
      return acc;
    }, {} as Record<string, FinancialAmount[]>);
    
    // Check for duplicate amounts (potential double-counting)
    Object.entries(byCategory).forEach(([category, amts]) => {
      const valueMap = new Map<number, FinancialAmount[]>();
      
      amts.forEach(amt => {
        if (!valueMap.has(amt.value)) {
          valueMap.set(amt.value, []);
        }
        valueMap.get(amt.value)!.push(amt);
      });
      
      valueMap.forEach((duplicates, value) => {
        if (duplicates.length > 1 && value > 1000) {
          inconsistencies.push({
            type: 'DUPLICATE_AMOUNT',
            description: `Same ${category} amount appears ${duplicates.length} times: $${value.toLocaleString()}`,
            amounts: duplicates.map(d => d.value),
            expected: value,
            actual: value * duplicates.length,
            discrepancy: value * (duplicates.length - 1),
            location: `Pages: ${duplicates.map(d => d.pageNumber).join(', ')}`,
            severity: 75
          });
        }
      });
    });
    
    // Check for sum mismatches in tables
    pages.forEach(page => {
      page.tables.forEach(table => {
        const mismatch = this.checkTableSums(table);
        if (mismatch) {
          inconsistencies.push({
            ...mismatch,
            location: `Page ${page.pageNumber}`,
            severity: 85
          });
        }
      });
    });
    
    return inconsistencies;
  }
  
  private checkTableSums(table: ExtractedTable): FinancialInconsistency | null {
    // Look for total rows
    const lastRow = table.rows[table.rows.length - 1];
    if (!lastRow) return null;
    
    const hasTotalLabel = lastRow.some(cell => 
      /total|sum|subtotal/i.test(cell)
    );
    
    if (!hasTotalLabel) return null;
    
    // Extract numbers from rows
    const numericRows = table.rows.slice(0, -1).map(row =>
      row.map(cell => {
        const match = cell.match(/([0-9,]+(?:\.[0-9]{2})?)/);
        return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      })
    );
    
    // Calculate sum
    if (numericRows.length > 0) {
      const columnSums = numericRows[0].map((_, colIndex) =>
        numericRows.reduce((sum, row) => sum + (row[colIndex] || 0), 0)
      );
      
      // Check against stated total
      const statedTotal = lastRow.map(cell => {
        const match = cell.match(/([0-9,]+(?:\.[0-9]{2})?)/);
        return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
      });
      
      for (let i = 0; i < columnSums.length; i++) {
        const calculated = columnSums[i];
        const stated = statedTotal[i];
        
        if (calculated > 0 && stated > 0 && Math.abs(calculated - stated) > 0.01) {
          return {
            type: 'TABLE_SUM_MISMATCH',
            description: 'Table totals do not match calculated sum',
            amounts: [calculated, stated],
            expected: calculated,
            actual: stated,
            discrepancy: Math.abs(calculated - stated),
            location: '',
            severity: 85
          };
        }
      }
    }
    
    return null;
  }
  
  // ==================== ENTITY EXTRACTION ====================
  
  private async extractEntities(text: string, pages: DocumentPage[]): Promise<ExtractedEntities> {
    console.log('👤 Extracting entities...');
    
    const people: Person[] = [];
    const companies: Company[] = [];
    const locations: Location[] = [];
    const dates: ExtractedDate[] = [];
    
    // Extract people (capitalized names)
    const nameRegex = /\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/g;
    const nameMatches = new Set<string>();
    
    pages.forEach((page) => {
      let match;
      while ((match = nameRegex.exec(page.text)) !== null) {
        nameMatches.add(match[1]);
      }
    });
    
    nameMatches.forEach(name => {
      const mentions: DocumentReference[] = [];
      
      pages.forEach((page) => {
        const lines = page.text.split('\n');
        lines.forEach((line, lineIndex) => {
          if (line.includes(name)) {
            mentions.push({
              pageNumber: page.pageNumber,
              lineNumber: lineIndex + 1,
              context: this.extractContext(line, line.indexOf(name), 100)
            });
          }
        });
      });
      
      if (mentions.length > 0) {
        people.push({
          name,
          mentions,
          relationships: []
        });
      }
    });
    
    console.log(`  ✅ Found ${people.length} people`);
    
    // Extract company names (Inc., LLC, Corp, etc.)
    const companyRegex = /([A-Z][A-Za-z0-9\s&]+(?:Inc\.|LLC|Corp\.|Corporation|Ltd\.|Limited|LLP))/g;
    const companyMatches = new Set<string>();
    
    pages.forEach((page) => {
      let match;
      while ((match = companyRegex.exec(page.text)) !== null) {
        companyMatches.add(match[1].trim());
      }
    });
    
    companyMatches.forEach(name => {
      const mentions: DocumentReference[] = [];
      
      pages.forEach((page) => {
        const lines = page.text.split('\n');
        lines.forEach((line, lineIndex) => {
          if (line.includes(name)) {
            mentions.push({
              pageNumber: page.pageNumber,
              lineNumber: lineIndex + 1,
              context: this.extractContext(line, line.indexOf(name), 100)
            });
          }
        });
      });
      
      if (mentions.length > 0) {
        companies.push({
          name,
          mentions
        });
      }
    });
    
    console.log(`  ✅ Found ${companies.length} companies`);
    
    return {
      people,
      companies,
      locations,
      dates
    };
  }
  
  // ==================== TIMELINE EXTRACTION ====================
  
  private async extractTimeline(text: string, pages: DocumentPage[]): Promise<ExtractedTimeline[]> {
    const timeline: ExtractedTimeline[] = [];
    
    // Extract dates (various formats)
    const dateRegex = /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi;
    
    pages.forEach((page) => {
      const lines = page.text.split('\n');
      
      lines.forEach((line, lineIndex) => {
        let match;
        while ((match = dateRegex.exec(line)) !== null) {
          timeline.push({
            date: this.parseDate(match[1]),
            event: this.extractContext(line, match.index, 150),
            pageNumber: page.pageNumber,
            lineNumber: lineIndex + 1
          });
        }
      });
    });
    
    // Sort by date
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    console.log(`  ✅ Extracted ${timeline.length} timeline events`);
    
    return timeline;
  }
  
  private parseDate(dateStr: string): Date {
    // Try to parse various date formats
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  }
  
  // ==================== DOCUMENT TYPE DETECTION ====================
  
  private detectDocumentType(text: string): string {
    const lower = text.toLowerCase();
    
    if (lower.includes('form 10-k') || lower.includes('annual report')) return '10-K';
    if (lower.includes('form 10-q') || lower.includes('quarterly report')) return '10-Q';
    if (lower.includes('form 8-k')) return '8-K';
    if (lower.includes('tax return') || lower.includes('form 1040')) return 'TAX_RETURN';
    if (lower.includes('invoice')) return 'INVOICE';
    if (lower.includes('contract') || lower.includes('agreement')) return 'CONTRACT';
    if (lower.includes('bank statement')) return 'BANK_STATEMENT';
    
    return 'UNKNOWN';
  }
  
  // ==================== UTILITIES ====================
  
  private extractContext(text: string, index: number, length: number): string {
    const start = Math.max(0, index - length / 2);
    const end = Math.min(text.length, index + length / 2);
    return '...' + text.substring(start, end).trim() + '...';
  }
}

// ==================== SUPPORTING INTERFACES ====================

interface ExtractedTable {
  headers: string[];
  rows: string[][];
  raw: string;
}

interface ChartData {
  type: string;
  data: any;
}

interface Location {
  name: string;
  type: string;
  mentions: DocumentReference[];
}

interface ExtractedDate {
  value: Date;
  context: string;
  pageNumber: number;
}

interface ExtractedTimeline {
  date: Date;
  event: string;
  pageNumber: number;
  lineNumber: number;
}

interface BankAccount {
  accountNumber: string;
  routingNumber?: string;
  balance?: number;
  mentions: DocumentReference[];
}

export { ParsedDocument, FinancialAmount, FinancialInconsistency };