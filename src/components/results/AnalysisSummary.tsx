import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Shield, Activity, Brain, Warning, FileText, Target } from '@phosphor-icons/react'
import { AnalysisResult } from '../../types/analysis'
import { formatRiskLevel } from '../../utils/formatters'

interface AnalysisSummaryProps {
  results: AnalysisResult
  className?: string
}

export const AnalysisSummary: React.FC<AnalysisSummaryProps> = ({
  results,
  className = ''
}) => {
  const riskLevel = 
    results.summary.riskScore >= 8.5 ? 'critical' :
    results.summary.riskScore >= 7.0 ? 'high' :
    results.summary.riskScore >= 5.0 ? 'medium' : 'low'

  const riskFormatted = formatRiskLevel(riskLevel)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Risk Score Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={24} />
              Overall Risk Assessment
            </div>
            <Badge className={`${riskFormatted.color} text-lg px-3 py-1`}>
              {riskFormatted.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {results.summary.riskScore.toFixed(1)}/10
              </div>
              <Progress 
                value={results.summary.riskScore * 10} 
                className="w-full h-3"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {results.summary.totalDocs}
                </div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {results.anomalies.length}
                </div>
                <div className="text-sm text-muted-foreground">Anomalies</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {results.summary.crossReferences}
                </div>
                <div className="text-sm text-muted-foreground">Cross-Refs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {Math.round(results.summary.aiConfidence * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">AI Confidence</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} />
            Analysis Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {results.modules.map((module, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{module.name}</h4>
                  <Badge variant="outline">{module.processed} docs</Badge>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  {module.nlpInsights}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Risk Score: {module.riskScore.toFixed(1)}/10</span>
                  <span>{module.patterns} patterns detected</span>
                </div>
                
                <Progress value={module.riskScore * 10} className="mt-2 h-2" />
                
                {module.keyFindings.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium mb-1">Key Findings:</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {module.keyFindings.map((finding, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <Warning size={10} className="mt-0.5 text-orange-500" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* NLP Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain size={20} />
            NLP Analysis Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-primary">
                {results.nlpSummary.linguisticInconsistencies}
              </div>
              <div className="text-xs text-muted-foreground">
                Linguistic Inconsistencies
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary">
                {results.nlpSummary.sentimentShifts}
              </div>
              <div className="text-xs text-muted-foreground">
                Sentiment Shifts
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary">
                {results.nlpSummary.entityRelationships}
              </div>
              <div className="text-xs text-muted-foreground">
                Entity Relationships
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary">
                {results.nlpSummary.riskLanguageInstances}
              </div>
              <div className="text-xs text-muted-foreground">
                Risk Language
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary">
                {results.nlpSummary.temporalAnomalies}
              </div>
              <div className="text-xs text-muted-foreground">
                Temporal Anomalies
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Analysis Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Analysis Time</div>
              <div className="text-muted-foreground">{results.summary.analysisTime}</div>
            </div>
            <div>
              <div className="font-medium">Custom Patterns</div>
              <div className="text-muted-foreground">{results.summary.nlpPatterns} active</div>
            </div>
            <div>
              <div className="font-medium">AI Confidence</div>
              <div className="text-muted-foreground">
                {Math.round(results.summary.aiConfidence * 100)}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}