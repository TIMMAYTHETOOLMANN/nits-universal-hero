// Demo integration showing how Phase 2 Enhanced Components work
// This demonstrates the enhanced AnalysisModule and ViolationItem components

import React from 'react'
import { EnhancedAnalysisModule, EnhancedViolationItem } from '@/components/enhanced'

export const EnhancedComponentsDemo: React.FC = () => {
  // Sample data showcasing enhanced features
  const sampleAnalysisModules = [
    {
      name: "Advanced Bayesian Insider Trading Detector",
      progress: 87,
      status: "ANALYZING",
      confidence: 0.94,
      findings: [
        "Suspicious timing pattern: 3 trades executed 24-48h before earnings announcements",
        "Cross-reference with Form 4 filings shows unreported beneficial ownership",
        "Trading volume spike correlates with 10-K amendments",
        "Pattern matches known insider trading signatures in ML model"
      ],
      analysisType: "ml" as const,
      metadata: {
        documentsScanned: 47,
        patternsMatched: 23,
        crossReferences: 15,
        timeElapsed: "2m 34s"
      }
    },
    {
      name: "Sophisticated ESG Greenwashing Analyzer",
      progress: 100,
      status: "COMPLETED",
      confidence: 0.89,
      findings: [
        "Sentiment divergence: Public statements 94% positive vs SEC filings 67% neutral",
        "Quantifiable metrics missing for 78% of ESG claims",
        "Forward-looking statements lack reasonable basis documentation",
        "Materiality thresholds not met for 45% of environmental claims"
      ],
      analysisType: "pattern" as const,
      metadata: {
        documentsScanned: 23,
        patternsMatched: 67,
        crossReferences: 31,
        timeElapsed: "4m 12s"
      }
    },
    {
      name: "Multi-Period Financial Engineering Detector",
      progress: 65,
      status: "PROCESSING",
      confidence: 0.76,
      findings: [
        "Non-GAAP adjustments exceed 40% of reported earnings",
        "Normalized earnings manipulation across 3 consecutive quarters",
        "Revenue recognition timing shifts detected",
        "Expense allocation irregularities in cost center 47-B"
      ],
      analysisType: "forensic" as const,
      metadata: {
        documentsScanned: 18,
        patternsMatched: 42,
        crossReferences: 28,
        timeElapsed: "1m 56s"
      }
    }
  ]

  const sampleViolations = [
    {
      statute: "15 U.S.C. § 78u-1(a)(3)",
      description: "Material misstatement or omission in periodic reports with scienter",
      severity: "CRIMINAL" as const,
      confidence: 94,
      evidence: [
        {
          exact_quote: "Revenue recognition practices materially overstated quarterly results by $2.3M through improper timing of contract completions and invoice dating manipulation.",
          section_reference: "Form 10-Q, Item 1A - Risk Factors, Page 47",
          page_number: 47,
          confidence_level: 0.96,
          materiality_threshold_met: true,
          source_file: "ACME-10Q-Q3-2024.pdf"
        },
        {
          exact_quote: "Internal emails confirm knowledge of revenue overstatement three weeks prior to earnings announcement, with instructions to 'maintain current accounting treatment until Q4 review'.",
          section_reference: "Discovery Document Set #4, Email Thread 2024-09-15",
          confidence_level: 0.91,
          materiality_threshold_met: true,
          source_file: "Internal-Communications-Discovery.pdf"
        }
      ],
      violationType: "financial_restatement",
      documentSource: "ACME-10Q-Q3-2024.pdf",
      penalty: {
        amount: 150000,
        currency: "$",
        basis: "Per violation under 15 U.S.C. § 78u-1"
      },
      crossReferences: {
        relatedStatutes: [
          "15 U.S.C. § 78t(d)",
          "17 CFR § 240.10b-5",
          "SOX § 302"
        ],
        precedentCases: [
          "SEC v. Honeywell Int'l Inc. (2003) - $5M penalty for revenue timing manipulation",
          "In re General Electric Co. (2009) - Accounting practices disclosure violations"
        ]
      },
      riskFactors: {
        litigation_probability: 87,
        regulatory_attention: 94,
        reputational_damage: 76
      }
    },
    {
      statute: "15 U.S.C. § 77h-1(g)",
      description: "ESG disclosure violations - material misrepresentation of environmental impact",
      severity: "CIVIL" as const,
      confidence: 82,
      evidence: [
        "Public sustainability report claims '40% reduction in carbon emissions' while SEC filing methodology shows only 12% reduction when properly calculated",
        "Third-party environmental audit contradicts published metrics by significant margin",
        "Forward-looking climate commitments lack reasonable basis or implementation timeline"
      ],
      violationType: "esg_greenwashing",
      documentSource: "ACME-Sustainability-Report-2024.pdf",
      penalty: {
        amount: 75000,
        currency: "$",
        basis: "Per misstatement under Exchange Act"
      },
      crossReferences: {
        relatedStatutes: [
          "17 CFR § 229.303",
          "15 U.S.C. § 78t(d)"
        ],
        precedentCases: [
          "In re Deutsche Bank AG (2021) - ESG fund misrepresentation penalties"
        ]
      },
      riskFactors: {
        litigation_probability: 65,
        regulatory_attention: 78,
        reputational_damage: 89
      }
    }
  ]

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-green-400 mb-2">
          Enhanced Analysis Modules - Phase 2 Components
        </h2>
        <p className="text-sm text-gray-400">
          Advanced interactive components with metadata, progress tracking, and expandable findings
        </p>
      </div>

      {/* Enhanced Analysis Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-cyan-400">
          Live Forensic Analysis Modules
        </h3>
        {sampleAnalysisModules.map((module, idx) => (
          <EnhancedAnalysisModule key={idx} {...module} />
        ))}
      </div>

      {/* Enhanced Violation Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-red-400">
          Enhanced Violation Detection Matrix
        </h3>
        <div className="space-y-3">
          {sampleViolations.map((violation, idx) => (
            <EnhancedViolationItem key={idx} {...violation} />
          ))}
        </div>
      </div>

      {/* Component Features Summary */}
      <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-md font-semibold text-purple-400 mb-3">
          Phase 2 Enhancement Features
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="text-green-400 font-medium mb-2">Analysis Module Enhancements:</h5>
            <ul className="space-y-1 text-gray-400">
              <li>• Enhanced progress bars with shimmer effects</li>
              <li>• Metadata display (docs scanned, patterns, time)</li>
              <li>• Analysis type categorization</li>
              <li>• Expandable findings with confidence indicators</li>
              <li>• Hover effects and smooth transitions</li>
            </ul>
          </div>
          <div>
            <h5 className="text-red-400 font-medium mb-2">Violation Item Enhancements:</h5>
            <ul className="space-y-1 text-gray-400">
              <li>• Detailed evidence with source references</li>
              <li>• Cross-reference display for related statutes</li>
              <li>• Risk factor assessment with visual indicators</li>
              <li>• Penalty calculation integration</li>
              <li>• Document source tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedComponentsDemo