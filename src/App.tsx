import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Toaster } from '@/components/ui/sonner'
import { Upload, FileText, Shield, Warning, Download, CaretDown, Activity } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface FileItem {
  name: string
  size: number
  type: string
}

interface AnalysisResult {
  summary: {
    totalDocs: number
    riskScore: number
    crossReferences: number
    analysisTime: string
  }
  anomalies: Array<{
    type: string
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
    description: string
    pattern: string
  }>
  modules: Array<{
    name: string
    processed: number
    patterns: number
    riskScore: number
  }>
  recommendations: string[]
}

const SUPPORTED_FORMATS = ['.pdf', '.html', '.xlsx', '.xls', '.xml', '.pptx', '.docx']
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

function App() {
  const [secFiles, setSecFiles] = useKV<FileItem[]>('sec-files', [])
  const [glamourFiles, setGlamourFiles] = useKV<FileItem[]>('glamour-files', [])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisPhase, setAnalysisPhase] = useState('')
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [consoleLog, setConsoleLog] = useState<string[]>([])

  const addToConsole = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setConsoleLog(prev => [...prev, `[${timestamp}] ${message}`])
  }, [])

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!SUPPORTED_FORMATS.includes(extension)) {
      toast.error(`Unsupported file format: ${extension}`)
      return false
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File too large: ${file.name} (${Math.round(file.size / 1024 / 1024)}MB)`)
      return false
    }
    return true
  }

  const handleFileUpload = (files: FileList | null, type: 'sec' | 'glamour') => {
    if (!files || files.length === 0) return
    
    const validFiles: FileItem[] = []
    
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        validFiles.push({
          name: file.name,
          size: file.size,
          type: file.type
        })
      }
    })

    if (validFiles.length > 0) {
      if (type === 'sec') {
        setSecFiles(prev => [...(prev || []), ...validFiles])
      } else {
        setGlamourFiles(prev => [...(prev || []), ...validFiles])
      }
      
      addToConsole(`Uploaded ${validFiles.length} files to ${type.toUpperCase()} zone`)
      toast.success(`Added ${validFiles.length} files to ${type.toUpperCase()} zone`)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('drag-over')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
  }

  const handleDrop = (e: React.DragEvent, type: 'sec' | 'glamour') => {
    e.preventDefault()
    e.currentTarget.classList.remove('drag-over')
    
    if (e.dataTransfer?.files) {
      handleFileUpload(e.dataTransfer.files, type)
    }
  }

  const executeAnalysis = async () => {
    if ((secFiles?.length || 0) === 0 && (glamourFiles?.length || 0) === 0) {
      toast.error('Please upload at least one document')
      return
    }

    setIsAnalyzing(true)
    setAnalysisProgress(0)
    setResults(null)
    addToConsole('Initiating forensic analysis...')

    const phases = [
      { name: 'Document ingestion and classification', progress: 20 },
      { name: 'Cross-document triangulation analysis', progress: 40 },
      { name: 'Discrepancy detection and risk scoring', progress: 60 },
      { name: 'Executive behavior pattern analysis', progress: 80 },
      { name: 'Results compilation and display', progress: 100 }
    ]

    for (const phase of phases) {
      setAnalysisPhase(phase.name)
      addToConsole(`Phase ${phases.indexOf(phase) + 1}: ${phase.name}`)
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000))
      setAnalysisProgress(phase.progress)
    }

    // Generate mock results
    const mockResults: AnalysisResult = {
      summary: {
        totalDocs: (secFiles?.length || 0) + (glamourFiles?.length || 0),
        riskScore: Math.random() * 10,
        crossReferences: Math.floor(Math.random() * 50) + 10,
        analysisTime: new Date().toLocaleString()
      },
      anomalies: [
        {
          type: 'Insider Trading Pattern',
          riskLevel: 'high',
          description: 'Form 4 filings show unusual timing correlation with earnings announcements',
          pattern: 'Executive-Timeline-Anomaly'
        },
        {
          type: 'ESG Greenwashing',
          riskLevel: 'medium',
          description: 'Sustainability claims lack quantifiable metrics in SEC filings',
          pattern: 'ESG-Metric-Gap'
        },
        {
          type: 'Disclosure Drift',
          riskLevel: 'critical',
          description: 'Material differences between 10-K risk factors and investor presentations',
          pattern: 'Cross-Document-Delta'
        }
      ],
      modules: [
        { name: 'Insider Timeline Scanner', processed: secFiles?.length || 0, patterns: 3, riskScore: 7.2 },
        { name: 'ESG Greenwashing Quantifier', processed: glamourFiles?.length || 0, patterns: 2, riskScore: 5.8 },
        { name: 'Cross-Document Delta Scanner', processed: (secFiles?.length || 0) + (glamourFiles?.length || 0), patterns: 5, riskScore: 8.9 },
        { name: 'SEC Litigation Risk Matrix', processed: secFiles?.length || 0, patterns: 1, riskScore: 4.3 },
        { name: 'Financial Engineering Detector', processed: secFiles?.length || 0, patterns: 4, riskScore: 6.7 },
        { name: 'Multi-Year Temporal Analyzer', processed: (secFiles?.length || 0) + (glamourFiles?.length || 0), patterns: 2, riskScore: 5.1 }
      ],
      recommendations: [
        'Immediate review of insider trading compliance protocols required',
        'ESG disclosure framework needs quantifiable metrics alignment',
        'Cross-reference SEC and public communications for consistency',
        'Consider legal review of disclosure timing patterns'
      ]
    }

    setResults(mockResults)
    setIsAnalyzing(false)
    addToConsole('Forensic analysis complete')
    toast.success('Analysis complete - review findings below')
  }

  const exportData = (format: 'txt' | 'csv' | 'json' | 'complete') => {
    if (!results) return

    let content = ''
    let filename = ''
    let mimeType = ''

    switch (format) {
      case 'txt':
        content = `NITS Forensic Intelligence Report
Generated: ${results.summary.analysisTime}

EXECUTIVE SUMMARY
Total Documents: ${results.summary.totalDocs}
Overall Risk Score: ${results.summary.riskScore.toFixed(1)}/10
Cross-References: ${results.summary.crossReferences}

CRITICAL ANOMALIES
${results.anomalies.map(a => `- ${a.type}: ${a.description} (Risk: ${a.riskLevel.toUpperCase()})`).join('\n')}

RECOMMENDATIONS
${results.recommendations.map(r => `- ${r}`).join('\n')}`
        filename = 'forensic-report.txt'
        mimeType = 'text/plain'
        break
      
      case 'csv':
        content = 'Category,Risk Score,Pattern,Description\n' +
          results.anomalies.map(a => `"${a.type}","${a.riskLevel}","${a.pattern}","${a.description}"`).join('\n')
        filename = 'discrepancy-matrix.csv'
        mimeType = 'text/csv'
        break
      
      case 'json':
        content = JSON.stringify({
          behaviorPatterns: results.anomalies,
          insiderActivity: results.modules.find(m => m.name.includes('Insider')),
          executiveAnalysis: results.recommendations
        }, null, 2)
        filename = 'executive-analysis.json'
        mimeType = 'application/json'
        break
      
      case 'complete':
        content = JSON.stringify(results, null, 2)
        filename = 'complete-forensic-package.json'
        mimeType = 'application/json'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    
    addToConsole(`Exported ${filename}`)
    toast.success(`Downloaded ${filename}`)
  }

  const clearFiles = (type: 'sec' | 'glamour' | 'all') => {
    if (type === 'sec' || type === 'all') {
      setSecFiles([])
    }
    if (type === 'glamour' || type === 'all') {
      setGlamourFiles([])
    }
    if (type === 'all') {
      setResults(null)
      setConsoleLog([])
    }
    addToConsole(`Cleared ${type} files`)
  }

  const getRiskColor = (score: number) => {
    if (score < 3.5) return 'risk-low'
    if (score < 5.5) return 'risk-medium'  
    if (score < 7.5) return 'risk-high'
    return 'risk-critical'
  }

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'low': return 'secondary'
      case 'medium': return 'outline'
      case 'high': return 'destructive'
      case 'critical': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="text-primary" size={32} />
          <h1 className="text-3xl font-bold tracking-tight">NITS Universal Forensic Intelligence System</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity size={16} />
            <span>System Status: ACTIVE</span>
          </div>
          <div>SEC Files: {secFiles?.length || 0}</div>
          <div>Public Files: {glamourFiles?.length || 0}</div>
          <div>Total Cross-References: {results?.summary.crossReferences || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-6">
          {/* Upload Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload size={20} />
                Document Upload System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* SEC Zone */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-primary">SEC Regulatory Zone</h3>
                <div
                  className="upload-zone p-8 rounded-lg text-center cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'sec')}
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = SUPPORTED_FORMATS.join(',')
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement
                      if (target.files) handleFileUpload(target.files, 'sec')
                    }
                    input.click()
                  }}
                >
                  <FileText size={48} className="mx-auto mb-4 text-primary" />
                  <p className="text-lg mb-2">10-K, 10-Q, 8-K, DEF 14A, Form 4/3/5, XBRL</p>
                  <p className="text-sm text-muted-foreground">Drag files here or click to upload</p>
                  {(secFiles || []).length > 0 && (
                    <div className="mt-4 space-y-1">
                      {(secFiles || []).map((file, i) => (
                        <div key={i} className="text-xs text-left bg-muted p-2 rounded">
                          {file.name} ({Math.round(file.size / 1024)}KB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Glamour Zone */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-accent">Public Glamour Zone</h3>
                <div
                  className="upload-zone p-8 rounded-lg text-center cursor-pointer"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'glamour')}
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.multiple = true
                    input.accept = SUPPORTED_FORMATS.join(',')
                    input.onchange = (e) => {
                      const target = e.target as HTMLInputElement
                      if (target.files) handleFileUpload(target.files, 'glamour')
                    }
                    input.click()
                  }}
                >
                  <FileText size={48} className="mx-auto mb-4 text-accent" />
                  <p className="text-lg mb-2">Annual Reports, Investor Presentations, Materials</p>
                  <p className="text-sm text-muted-foreground">Drag files here or click to upload</p>
                  {(glamourFiles || []).length > 0 && (
                    <div className="mt-4 space-y-1">
                      {(glamourFiles || []).map((file, i) => (
                        <div key={i} className="text-xs text-left bg-muted p-2 rounded">
                          {file.name} ({Math.round(file.size / 1024)}KB)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={executeAnalysis} 
                  disabled={isAnalyzing || ((secFiles?.length || 0) === 0 && (glamourFiles?.length || 0) === 0)}
                  className="flex-1"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Execute Forensic Analysis'}
                </Button>
                <Button variant="outline" onClick={() => clearFiles('all')}>
                  Clear All
                </Button>
              </div>

              {/* Analysis Progress */}
              {isAnalyzing && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>{analysisPhase}</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="analysis-progress" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Console Output */}
          <Card>
            <CardHeader>
              <CardTitle>System Console</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="console-output p-4 rounded h-40 overflow-y-auto text-xs">
                {consoleLog.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-6">
          {results && (
            <>
              {/* Analysis Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Warning size={20} />
                    Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{results.summary.totalDocs}</div>
                      <div className="text-sm text-muted-foreground">Documents Analyzed</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getRiskColor(results.summary.riskScore)}`}>
                        {results.summary.riskScore.toFixed(1)}/10
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Risk Score</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">{results.summary.crossReferences}</div>
                      <div className="text-sm text-muted-foreground">Cross-References</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{results.summary.analysisTime}</div>
                      <div className="text-sm text-muted-foreground">Analysis Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Critical Anomalies */}
              <Collapsible>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Warning size={20} className="text-destructive" />
                          Critical Anomalies ({results.anomalies.length})
                        </span>
                        <CaretDown size={20} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {results.anomalies.map((anomaly, i) => (
                        <div key={i} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{anomaly.type}</h4>
                            <Badge variant={getRiskBadgeVariant(anomaly.riskLevel)}>
                              {anomaly.riskLevel.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{anomaly.description}</p>
                          <div className="text-xs text-primary">Pattern: {anomaly.pattern}</div>
                        </div>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Module Results */}
              <Collapsible>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <CardTitle className="flex items-center justify-between">
                        <span>Detection Module Results</span>
                        <CaretDown size={20} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="space-y-3">
                        {results.modules.map((module, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded">
                            <div>
                              <div className="font-medium">{module.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {module.processed} docs • {module.patterns} patterns
                              </div>
                            </div>
                            <div className={`font-bold ${getRiskColor(module.riskScore)}`}>
                              {module.riskScore.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Strategic Recommendations */}
              <Collapsible>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50">
                      <CardTitle className="flex items-center justify-between">
                        <span>Strategic Recommendations</span>
                        <CaretDown size={20} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download size={20} />
                    Export Forensic Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => exportData('txt')}>
                      Forensic Report (.txt)
                    </Button>
                    <Button variant="outline" onClick={() => exportData('csv')}>
                      Discrepancy Matrix (.csv)
                    </Button>
                    <Button variant="outline" onClick={() => exportData('json')}>
                      Executive Analysis (.json)
                    </Button>
                    <Button variant="outline" onClick={() => exportData('complete')}>
                      Complete Package (.json)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  )
}

export default App