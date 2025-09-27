import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { Badge } from '@/components/ui/badge'
import { Upload, Calculator, Eye, Shield, Robot } from '@phosphor-icons/react'
import { toast } from 'sonner'

// Import modular components
import { DocumentUploadZone } from './components/document/DocumentUploadZone'
import { AnalysisProgress } from './components/document/AnalysisProgress'
import { AutonomousTrainingModule } from './components/training/AutonomousTrainingModule'
import { AnalysisSummary } from './components/results/AnalysisSummary'
import { FinancialMatrix } from './components/financial/FinancialMatrix'
import { SystemConsole } from './components/console/SystemConsole'

// Import custom hooks
import { useAnalysis } from './hooks/useAnalysis'
import { useFileManagement } from './hooks/useFileManagement'
import { useAutonomousTraining } from './hooks/useAutonomousTraining'
import { usePenaltyCalculation } from './hooks/usePenaltyCalculation'
import { useConsole } from './hooks/useConsole'

// Declare spark global
declare global {
  interface Window {
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
    }
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('upload')

  // Initialize all hooks
  const analysis = useAnalysis()
  const fileManagement = useFileManagement()
  const autonomousTraining = useAutonomousTraining()
  const penalties = usePenaltyCalculation()
  const console = useConsole()

  // Auto-generate patterns after successful analysis
  useEffect(() => {
    if (analysis.results && !autonomousTraining.isTraining) {
      autonomousTraining.generateAutonomousPatterns(analysis.results, console.addToConsole)
    }
  }, [analysis.results, autonomousTraining.isTraining])

  // Calculate penalties when violations are detected
  useEffect(() => {
    if (analysis.results?.violations && analysis.results.violations.length > 0) {
      penalties.calculatePenalties(analysis.results.violations, console.addToConsole)
    }
  }, [analysis.results?.violations])

  const handleAnalysisExecution = () => {
    // Convert autonomous patterns to the format expected by analysis
    const convertedPatterns = autonomousTraining.getActivePatterns().map(pattern => ({
      ...pattern,
      description: `Auto-generated pattern for ${pattern.violationType}`,
      category: 'custom' as const,
      rules: pattern.keywords.map(keyword => `content contains "${keyword}"`),
      severity: 'medium' as const,
      isActive: pattern.isActive,
      createdAt: pattern.generatedAt,
      lastTested: null as string | null,
      testResults: {
        totalTests: 0,
        successRate: pattern.performance,
        falsePositives: 0,
        lastTestDate: null as string | null
      }
    }))

    analysis.executeAnalysis(
      fileManagement.secFiles,
      fileManagement.glamourFiles,
      convertedPatterns,
      console.addToConsole
    )
  }

  const handleFileUpload = (files: FileList | null, type: 'sec' | 'glamour') => {
    const result = fileManagement.handleFileUpload(files, type)
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    
    if (result.errors) {
      result.errors.forEach(error => toast.error(error))
    }
    
    console.addToConsole(result.message)
  }

  const handleExportMatrix = (format: string) => {
    if (!penalties.penaltyMatrix) return
    
    penalties.exportPenaltyMatrix(format)
    console.addToConsole(`Exported penalty matrix in ${format.toUpperCase()} format`)
  }

  const canExecuteAnalysis = fileManagement.getTotalFileCount() > 0

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield size={32} className="text-primary" />
          NITS Universal Forensic Intelligence System
          <Badge variant="outline" className="text-xs">
            AI-Enhanced v2.0
          </Badge>
        </h1>
        <p className="text-muted-foreground">
          Advanced forensic analysis with autonomous AI pattern training and surgical SEC penalty calculations
        </p>
        
        {/* System Status */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div>
            Files: {fileManagement.getTotalFileCount()} 
            ({fileManagement.secFiles.length} SEC, {fileManagement.glamourFiles.length} Glamour)
          </div>
          <div>
            AI Patterns: {autonomousTraining.autonomousPatterns?.length || 0} 
            ({autonomousTraining.getActivePatterns().length} active)
          </div>
          {autonomousTraining.trainingStatus?.isActive && (
            <Badge variant="outline" className="text-xs">
              <Robot size={10} className="mr-1" />
              Auto-Training Active
            </Badge>
          )}
          {penalties.penaltyMatrix && (
            <Badge variant="outline" className="text-xs text-orange-400">
              <Calculator size={10} className="mr-1" />
              ${penalties.penaltyMatrix.grand_total.toLocaleString()} Total Exposure
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload size={16} />
            Document Analysis
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <Calculator size={16} />
            Financial Matrix
            {penalties.penaltyMatrix && (
              <Badge variant="outline" className="text-xs ml-1">
                ${(penalties.penaltyMatrix.grand_total / 1000000).toFixed(1)}M
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2" disabled={!analysis.results}>
            <Eye size={16} />
            Results Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Document Analysis Tab */}
        <TabsContent value="upload">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Upload and Controls */}
            <div className="space-y-6">
              <DocumentUploadZone
                title="SEC Regulatory Zone"
                description="10-K, 10-Q, 8-K, DEF 14A, Form 4/3/5, XBRL"
                files={fileManagement.secFiles}
                onFileUpload={(files) => handleFileUpload(files, 'sec')}
                onClear={() => fileManagement.clearFiles('sec')}
                icon={<Shield size={20} />}
              />

              <DocumentUploadZone
                title="Public Glamour Zone"
                description="Press releases, earnings calls, investor presentations"
                files={fileManagement.glamourFiles}
                onFileUpload={(files) => handleFileUpload(files, 'glamour')}
                onClear={() => fileManagement.clearFiles('glamour')}
                icon={<Upload size={20} />}
              />

              <AnalysisProgress
                isAnalyzing={analysis.isAnalyzing}
                progress={analysis.analysisProgress}
                phase={analysis.analysisPhase}
                onExecute={handleAnalysisExecution}
                canExecute={canExecuteAnalysis}
              />

              {/* Embedded Autonomous Training Module */}
              <AutonomousTrainingModule
                trainingStatus={autonomousTraining.trainingStatus || {
                  isActive: false,
                  currentPhase: 'Idle',
                  progress: 0,
                  patternsGenerated: 0,
                  lastTrainingTime: null,
                  trainingLog: []
                }}
                autonomousPatterns={autonomousTraining.autonomousPatterns || []}
                isTraining={autonomousTraining.isTraining}
                onTogglePattern={autonomousTraining.togglePattern}
                onDeletePattern={autonomousTraining.deletePattern}
                onClearLog={autonomousTraining.clearTrainingLog}
              />
            </div>

            {/* Right Column - Console */}
            <div>
              <SystemConsole
                consoleLog={console.consoleLog}
                onClear={console.clearConsole}
                onExport={console.exportConsoleLog}
                maxHeight="800px"
              />
            </div>
          </div>
        </TabsContent>

        {/* Financial Matrix Tab */}
        <TabsContent value="financial">
          <FinancialMatrix
            violations={analysis.results?.violations || []}
            penaltyMatrix={penalties.penaltyMatrix}
            isCalculating={penalties.isCalculating}
            onExportMatrix={handleExportMatrix}
            onRecalculate={() => {
              if (analysis.results?.violations) {
                penalties.calculatePenalties(analysis.results.violations, console.addToConsole)
              }
            }}
          />
        </TabsContent>

        {/* Results Dashboard Tab */}
        <TabsContent value="results">
          {analysis.results ? (
            <AnalysisSummary results={analysis.results} />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No analysis results available. Run an analysis first.
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}

export default App