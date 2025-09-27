import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/sonner'
import { Badge } from '@/components/ui/badge'
import { Upload, Target, Eye, Shield, Robot } from '@phosphor-icons/react'
import { toast } from 'sonner'

// Import modular components
import { DocumentUploadZone } from './components/document/DocumentUploadZone'
import { AnalysisProgress } from './components/document/AnalysisProgress'
import { PatternCreator } from './components/patterns/PatternCreator'
import { PatternList } from './components/patterns/PatternList'
import { AnalysisSummary } from './components/results/AnalysisSummary'
import { SystemConsole } from './components/console/SystemConsole'

// Import custom hooks
import { useAnalysis } from './hooks/useAnalysis'
import { useFileManagement } from './hooks/useFileManagement'
import { usePatterns } from './hooks/usePatterns'
import { usePenaltyCalculation } from './hooks/usePenaltyCalculation'
import { useConsole } from './hooks/useConsole'

// Import types
import { CustomPattern } from './types/patterns'

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
  const patterns = usePatterns()
  const penalties = usePenaltyCalculation()
  const console = useConsole()

  // Auto-generate patterns after successful analysis
  useEffect(() => {
    if (analysis.results && patterns.autoTrainingEnabled && !patterns.trainingInProgress) {
      patterns.generateAutonomousPatterns(analysis.results, console.addToConsole)
    }
  }, [analysis.results, patterns.autoTrainingEnabled, patterns.trainingInProgress])

  // Calculate penalties when violations are detected
  useEffect(() => {
    if (analysis.results?.violations && analysis.results.violations.length > 0) {
      penalties.calculatePenalties(analysis.results.violations, console.addToConsole)
    }
  }, [analysis.results?.violations])

  const handleAnalysisExecution = () => {
    analysis.executeAnalysis(
      fileManagement.secFiles,
      fileManagement.glamourFiles,
      patterns.customPatterns,
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

  const handleCreatePattern = async () => {
    const result = await patterns.createCustomPattern()
    
    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
    
    console.addToConsole(result.message)
    return result
  }

  const handleTestPattern = (id: string) => {
    patterns.testPattern(id, console.addToConsole)
  }

  const handleTogglePattern = (id: string) => {
    patterns.togglePattern(id)
    const pattern = patterns.getPatternById(id)
    const action = pattern?.isActive ? 'activated' : 'deactivated'
    console.addToConsole(`Pattern "${pattern?.name}" ${action}`)
  }

  const handleDeletePattern = (id: string) => {
    const pattern = patterns.getPatternById(id)
    patterns.deletePattern(id)
    console.addToConsole(`Pattern "${pattern?.name}" deleted`)
    toast.success(`Pattern deleted: ${pattern?.name}`)
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
          Advanced forensic analysis with AI-powered pattern detection and SEC penalty calculations
        </p>
        
        {/* System Status */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div>
            Files: {fileManagement.getTotalFileCount()} 
            ({fileManagement.secFiles.length} SEC, {fileManagement.glamourFiles.length} Glamour)
          </div>
          <div>
            Patterns: {patterns.customPatterns.length} 
            ({patterns.getActivePatterns().length} active)
          </div>
          {patterns.autoTrainingEnabled && (
            <Badge variant="outline" className="text-xs">
              <Robot size={10} className="mr-1" />
              Auto-Training Enabled
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
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Target size={16} />
            Pattern Training
            {patterns.autoTrainingEnabled && patterns.trainingInProgress && (
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
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
            </div>

            {/* Right Column - Console */}
            <div>
              <SystemConsole
                consoleLog={console.consoleLog}
                onClear={console.clearConsole}
                onExport={console.exportConsoleLog}
                maxHeight="600px"
              />
            </div>
          </div>
        </TabsContent>

        {/* Pattern Training Tab */}
        <TabsContent value="patterns">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Pattern Creator */}
            <div className="space-y-6">
              <PatternCreator
                newPattern={patterns.newPattern}
                onPatternChange={patterns.setNewPattern}
                onCreatePattern={handleCreatePattern}
              />

              {/* Auto-Training Panel */}
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Robot size={16} />
                    Autonomous Pattern Training
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={patterns.autoTrainingEnabled}
                      onChange={(e) => patterns.setAutoTrainingEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Enable Auto-Training</span>
                  </label>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  Automatically generate and optimize patterns based on analysis results
                </p>
                
                {patterns.lastAutoTraining && (
                  <div className="text-xs text-muted-foreground">
                    Last training: {new Date(patterns.lastAutoTraining).toLocaleString()}
                  </div>
                )}
                
                {patterns.trainingLog.length > 0 && (
                  <div className="mt-3 bg-background rounded p-2 text-xs max-h-32 overflow-y-auto">
                    {patterns.trainingLog.slice(-5).map((log, i) => (
                      <div key={i} className="text-muted-foreground">{log}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Pattern List */}
            <div>
              <PatternList
                patterns={patterns.customPatterns}
                testingPattern={patterns.testingPattern}
                onTogglePattern={handleTogglePattern}
                onTestPattern={handleTestPattern}
                onDeletePattern={handleDeletePattern}
              />
            </div>
          </div>
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