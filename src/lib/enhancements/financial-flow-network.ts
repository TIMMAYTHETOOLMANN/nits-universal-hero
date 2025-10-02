// ============================================================================
// NITS ENHANCEMENT #4: ADVANCED FINANCIAL FLOW TRACING & NETWORK ANALYSIS
// PURPOSE: Comprehensive financial network analysis and money flow tracing
// ============================================================================

import { ParsedDocument, DetailedViolation } from '../real_violation_detector';

export interface FinancialNode {
  id: string;
  type: 'ACCOUNT' | 'ENTITY' | 'TRANSACTION' | 'SHELL_COMPANY';
  name: string;
  amount?: number;
  riskScore: number;
  metadata: any;
}

export interface FinancialEdge {
  source: string;
  target: string;
  amount: number;
  date: Date;
  type: 'TRANSFER' | 'PAYMENT' | 'LOAN' | 'INVESTMENT';
  confidence: number;
}

export interface FinancialNetwork {
  nodes: FinancialNode[];
  edges: FinancialEdge[];
  clusters: FinancialCluster[];
  suspiciousPatterns: SuspiciousPattern[];
}

export interface FinancialCluster {
  id: string;
  nodes: string[];
  totalFlow: number;
  suspicionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  characteristics: string[];
}

export interface SuspiciousPattern {
  patternId: string;
  type: 'LAYERING' | 'ROUND_ROBIN' | 'STRUCTURING' | 'SHELL_CASCADE';
  description: string;
  involvedNodes: string[];
  riskScore: number;
  evidence: string[];
}

export class FinancialFlowNetworkAnalyzer {
  private network: FinancialNetwork;
  
  constructor() {
    this.network = {
      nodes: [],
      edges: [],
      clusters: [],
      suspiciousPatterns: []
    };
  }

  async analyzeFinancialFlow(parsed: ParsedDocument, violations: DetailedViolation[]): Promise<FinancialNetwork> {
    console.log('💰 Analyzing financial flow network...');

    // Build financial network
    await this.buildFinancialNetwork(parsed);
    
    // Detect clusters
    this.detectFinancialClusters();
    
    // Identify suspicious patterns
    await this.identifySuspiciousPatterns();

    console.log(`  ✅ Built network: ${this.network.nodes.length} nodes, ${this.network.edges.length} edges`);
    return this.network;
  }

  private async buildFinancialNetwork(parsed: ParsedDocument): Promise<void> {
    // Extract financial nodes from entities and amounts
    this.extractFinancialNodes(parsed);
    
    // Build connections between nodes
    this.buildFinancialConnections(parsed);
  }

  private extractFinancialNodes(parsed: ParsedDocument): void {
    // Add company nodes
    parsed.entities.companies.forEach(company => {
      this.network.nodes.push({
        id: `ENTITY-${company.name}`,
        type: 'ENTITY',
        name: company.name,
        riskScore: this.calculateEntityRiskScore(company, parsed),
        metadata: { mentions: company.mentions.length }
      });
    });

    // Add transaction nodes for significant amounts
    parsed.financials.amounts.forEach((amount, index) => {
      if (amount.value > 10000) {
        this.network.nodes.push({
          id: `TX-${index}`,
          type: 'TRANSACTION',
          name: `Transaction: $${amount.value.toLocaleString()}`,
          amount: amount.value,
          riskScore: amount.suspiciousScore,
          metadata: { 
            category: amount.category,
            page: amount.pageNumber,
            context: amount.context
          }
        });
      }
    });
  }

  private buildFinancialConnections(parsed: ParsedDocument): void {
    // Simple connection building based on proximity in document
    const entities = this.network.nodes.filter(n => n.type === 'ENTITY');
    const transactions = this.network.nodes.filter(n => n.type === 'TRANSACTION');

    transactions.forEach(tx => {
      const relatedEntities = entities.filter(entity => {
        return tx.metadata.context.toLowerCase().includes(entity.name.toLowerCase());
      });

      relatedEntities.forEach(entity => {
        this.network.edges.push({
          source: entity.id,
          target: tx.id,
          amount: tx.amount || 0,
          date: new Date(),
          type: 'TRANSFER',
          confidence: 0.7
        });
      });
    });
  }

  private detectFinancialClusters(): void {
    // Simple clustering based on connected components
    const visited = new Set<string>();
    let clusterId = 0;

    this.network.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const cluster = this.exploreCluster(node.id, visited);
        if (cluster.length > 1) {
          const totalFlow = cluster.reduce((sum, nodeId) => {
            const node = this.network.nodes.find(n => n.id === nodeId);
            return sum + (node?.amount || 0);
          }, 0);

          this.network.clusters.push({
            id: `CLUSTER-${clusterId++}`,
            nodes: cluster,
            totalFlow,
            suspicionLevel: this.assessClusterSuspicion(totalFlow, cluster.length),
            characteristics: this.analyzeClusterCharacteristics(cluster)
          });
        }
      }
    });
  }

  private exploreCluster(nodeId: string, visited: Set<string>): string[] {
    const cluster: string[] = [];
    const stack = [nodeId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (!visited.has(current)) {
        visited.add(current);
        cluster.push(current);

        // Find connected nodes
        const connections = this.network.edges.filter(e => 
          e.source === current || e.target === current
        );

        connections.forEach(edge => {
          const next = edge.source === current ? edge.target : edge.source;
          if (!visited.has(next)) {
            stack.push(next);
          }
        });
      }
    }

    return cluster;
  }

  private assessClusterSuspicion(totalFlow: number, nodeCount: number): FinancialCluster['suspicionLevel'] {
    let score = 0;
    
    if (totalFlow > 10000000) score += 3;
    else if (totalFlow > 1000000) score += 2;
    else if (totalFlow > 100000) score += 1;
    
    if (nodeCount > 10) score += 2;
    else if (nodeCount > 5) score += 1;

    if (score >= 4) return 'CRITICAL';
    if (score >= 3) return 'HIGH';
    if (score >= 2) return 'MEDIUM';
    return 'LOW';
  }

  private analyzeClusterCharacteristics(nodeIds: string[]): string[] {
    const characteristics: string[] = [];
    const nodes = nodeIds.map(id => this.network.nodes.find(n => n.id === id)!);
    
    const entityCount = nodes.filter(n => n.type === 'ENTITY').length;
    const txCount = nodes.filter(n => n.type === 'TRANSACTION').length;
    
    if (entityCount > 5) characteristics.push('COMPLEX_ENTITY_STRUCTURE');
    if (txCount > 10) characteristics.push('HIGH_TRANSACTION_VOLUME');
    
    const avgRisk = nodes.reduce((sum, n) => sum + n.riskScore, 0) / nodes.length;
    if (avgRisk > 70) characteristics.push('HIGH_RISK_CLUSTER');

    return characteristics;
  }

  private async identifySuspiciousPatterns(): Promise<void> {
    // Detect layering patterns
    this.detectLayeringPatterns();
    
    // Detect round-robin patterns
    this.detectRoundRobinPatterns();
    
    // Detect structuring patterns
    this.detectStructuringPatterns();
  }

  private detectLayeringPatterns(): void {
    // Find chains of transactions that might indicate layering
    const chains = this.findTransactionChains();
    
    chains.forEach((chain, index) => {
      if (chain.length >= 3) {
        this.network.suspiciousPatterns.push({
          patternId: `LAYERING-${index}`,
          type: 'LAYERING',
          description: `Transaction chain with ${chain.length} hops indicating possible layering`,
          involvedNodes: chain,
          riskScore: Math.min(chain.length * 20, 100),
          evidence: [`${chain.length}-hop transaction chain`, 'Multiple intermediary entities']
        });
      }
    });
  }

  private findTransactionChains(): string[][] {
    const chains: string[][] = [];
    const visited = new Set<string>();

    this.network.nodes.forEach(node => {
      if (node.type === 'ENTITY' && !visited.has(node.id)) {
        const chain = this.traceTransactionPath(node.id, visited, []);
        if (chain.length > 2) {
          chains.push(chain);
        }
      }
    });

    return chains;
  }

  private traceTransactionPath(nodeId: string, visited: Set<string>, path: string[]): string[] {
    if (visited.has(nodeId) || path.includes(nodeId)) {
      return path;
    }

    const newPath = [...path, nodeId];
    visited.add(nodeId);

    const outgoingEdges = this.network.edges.filter(e => e.source === nodeId);
    
    if (outgoingEdges.length === 0) {
      return newPath;
    }

    let longestPath = newPath;
    outgoingEdges.forEach(edge => {
      const extendedPath = this.traceTransactionPath(edge.target, new Set(visited), newPath);
      if (extendedPath.length > longestPath.length) {
        longestPath = extendedPath;
      }
    });

    return longestPath;
  }

  private detectRoundRobinPatterns(): void {
    // Detect circular transaction patterns
    const cycles = this.findCycles();
    
    cycles.forEach((cycle, index) => {
      const totalAmount = this.calculateCycleAmount(cycle);
      
      this.network.suspiciousPatterns.push({
        patternId: `ROUND_ROBIN-${index}`,
        type: 'ROUND_ROBIN',
        description: `Circular transaction pattern involving ${cycle.length} entities`,
        involvedNodes: cycle,
        riskScore: Math.min(cycle.length * 25 + (totalAmount / 100000), 100),
        evidence: ['Circular money flow', `$${totalAmount.toLocaleString()} total flow`]
      });
    });
  }

  private findCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    this.network.nodes.forEach(node => {
      if (!visited.has(node.id)) {
        this.detectCycle(node.id, visited, recursionStack, [], cycles);
      }
    });

    return cycles;
  }

  private detectCycle(
    nodeId: string, 
    visited: Set<string>, 
    recursionStack: Set<string>, 
    path: string[], 
    cycles: string[][]
  ): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = this.network.edges
      .filter(e => e.source === nodeId)
      .map(e => e.target);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (this.detectCycle(neighbor, visited, recursionStack, [...path], cycles)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        if (cycleStart !== -1) {
          const cycle = path.slice(cycleStart);
          cycles.push(cycle);
        }
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  private calculateCycleAmount(cycle: string[]): number {
    return cycle.reduce((sum, nodeId) => {
      const node = this.network.nodes.find(n => n.id === nodeId);
      return sum + (node?.amount || 0);
    }, 0);
  }

  private detectStructuringPatterns(): void {
    // Find patterns of amounts just under reporting thresholds
    const structuringAmounts = this.network.nodes
      .filter(n => n.type === 'TRANSACTION' && n.amount)
      .filter(n => n.amount! >= 9000 && n.amount! < 10000);

    if (structuringAmounts.length >= 3) {
      const totalAmount = structuringAmounts.reduce((sum, n) => sum + n.amount!, 0);
      
      this.network.suspiciousPatterns.push({
        patternId: 'STRUCTURING-001',
        type: 'STRUCTURING',
        description: `${structuringAmounts.length} transactions just under $10,000 reporting threshold`,
        involvedNodes: structuringAmounts.map(n => n.id),
        riskScore: Math.min(structuringAmounts.length * 15, 100),
        evidence: [
          `${structuringAmounts.length} transactions between $9,000-$10,000`,
          `Total amount: $${totalAmount.toLocaleString()}`,
          'Pattern suggests deliberate structuring to avoid reporting'
        ]
      });
    }
  }

  private calculateEntityRiskScore(company: any, parsed: ParsedDocument): number {
    let score = 0;
    
    // Base score from mentions
    score += Math.min(company.mentions.length * 5, 30);
    
    // Check if mentioned in suspicious contexts
    const suspiciousTerms = ['shell', 'nominee', 'offshore', 'cayman'];
    const companyText = company.mentions.map((m: any) => m.context.toLowerCase()).join(' ');
    
    suspiciousTerms.forEach(term => {
      if (companyText.includes(term)) {
        score += 20;
      }
    });

    return Math.min(score, 100);
  }

  async generateNetworkAnalysisReport(): Promise<any> {
    console.log('📊 Generating financial network analysis report...');

    return {
      reportId: `NETWORK-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      
      networkStatistics: {
        totalNodes: this.network.nodes.length,
        totalEdges: this.network.edges.length,
        totalClusters: this.network.clusters.length,
        suspiciousPatterns: this.network.suspiciousPatterns.length,
        totalFlow: this.calculateTotalNetworkFlow()
      },
      
      riskAssessment: {
        highRiskNodes: this.network.nodes.filter(n => n.riskScore >= 70).length,
        criticalClusters: this.network.clusters.filter(c => c.suspicionLevel === 'CRITICAL').length,
        overallNetworkRisk: this.calculateOverallNetworkRisk()
      },
      
      suspiciousPatterns: this.network.suspiciousPatterns,
      clusters: this.network.clusters,
      
      recommendations: this.generateNetworkRecommendations()
    };
  }

  private calculateTotalNetworkFlow(): number {
    return this.network.edges.reduce((sum, edge) => sum + edge.amount, 0);
  }

  private calculateOverallNetworkRisk(): number {
    const avgNodeRisk = this.network.nodes.reduce((sum, n) => sum + n.riskScore, 0) / Math.max(this.network.nodes.length, 1);
    const patternRisk = this.network.suspiciousPatterns.reduce((sum, p) => sum + p.riskScore, 0) / Math.max(this.network.suspiciousPatterns.length, 1);
    
    return Math.min((avgNodeRisk + patternRisk) / 2, 100);
  }

  private generateNetworkRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.network.suspiciousPatterns.length > 0) {
      recommendations.push('IMMEDIATE INVESTIGATION OF SUSPICIOUS FINANCIAL PATTERNS');
    }
    
    if (this.network.clusters.some(c => c.suspicionLevel === 'CRITICAL')) {
      recommendations.push('PRIORITY ANALYSIS OF HIGH-RISK FINANCIAL CLUSTERS');
    }
    
    recommendations.push('COMPREHENSIVE BENEFICIAL OWNERSHIP INVESTIGATION');
    recommendations.push('COORDINATE WITH FINANCIAL INTELLIGENCE UNITS');
    
    return recommendations;
  }
}

export { FinancialFlowNetworkAnalyzer };