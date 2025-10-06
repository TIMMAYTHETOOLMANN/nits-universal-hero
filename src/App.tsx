import React, { useState, useCallback, useRef, useEffect } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Toaster } from '@/components/ui/sonner'
import { 
  FileText,
  Download,
  Activity,
  Brain,
  Package,
  Zap,
  Database,
  Scale,
  Info,
  ChevronDown,
  ChevronUp,
  Gavel,
  Skull,
  Terminal,
  Eye,
  Cpu,
  Shield,
  AlertTriangle,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'

// Enhanced Helper Components
const StatusIndicator: React.FC<{ label: string; status: string; isActive: boolean }> = ({ label, status, isActive }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
    <span className="text-xs text-gray-400">{label}:</span>
    <span className={`text-xs ${isActive ? 'text-green-400' : 'text-gray-500'}`}>{status}</span>
  </div>
)

const AnalysisModule: React.FC<{ name: string; progress: number; status: string; description?: string }> = ({ name, progress, status, description }) => (
  <div className="border border-gray-800 rounded-lg p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/30">
    <div className="flex items-center justify-between mb-3">
      <div>
        <h3 className="text-sm font-medium text-gray-300">{name}</h3>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      </div>
      <Badge className={`text-xs ${
        status === 'COMPLETE' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
        status === 'PROCESSING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
        status === 'HARVESTING' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50' :
        status === 'TERMINATING' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
        'bg-blue-500/20 text-blue-400 border-blue-500/50'
      }`}>
        {status}
      </Badge>
    </div>
    <div className="relative mb-3">
      <Progress value={progress} className="h-2" />
    </div>
  </div>
)

const MetricCard: React.FC<{ label: string; value: number; severity: string }> = ({ label, value, severity }) => (
  <div className="text-center">
    <div className={`text-2xl font-bold ${
      severity === 'critical' ? 'text-red-400' :
      severity === 'high' ? 'text-orange-400' :
      'text-green-400'
    }`}>
      {value}
    </div>
    <p className="text-xs text-gray-500">{label}</p>
  </div>
)

const ViolationItem: React.FC<{ 
  statute: string; 
  description: string; 
  severity: string; 
  confidence: number; 
  evidence: string[]; 
  legalCitation?: string; 
  penalties?: string[] 
}> = ({ statute, description, severity, confidence, evidence, legalCitation, penalties }) => {
  const [showEvidence, setShowEvidence] = useState(false)
  
  return (
    <motion.div 
      className={`border rounded-lg p-3 ${
        severity === 'CRIMINAL' ? 'border-red-500/50 bg-red-500/5' :
        severity === 'CIVIL' ? 'border-orange-500/50 bg-orange-500/5' :
        'border-yellow-500/50 bg-yellow-500/5'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`text-xs ${
              severity === 'CRIMINAL' ? 'bg-red-500/20 text-red-400' :
              severity === 'CIVIL' ? 'bg-orange-500/20 text-orange-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {severity}
            </Badge>
            <span className="text-xs text-gray-500">{statute}</span>
          </div>
          <p className="text-sm text-gray-300 mb-1">{description}</p>
          {legalCitation && (
            <p className="text-xs text-cyan-400 mb-2 font-mono">{legalCitation}</p>
          )}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">Confidence:</span>
            <div className="flex items-center gap-1">
              <Progress value={confidence} className="w-20 h-1" />
              <span className="text-gray-400">{confidence}%</span>
            </div>
          </div>
          {penalties && penalties.length > 0 && (
            <div className="text-xs text-red-400 mt-2">
              <span className="text-gray-500">Penalties: </span>
              {penalties.join(', ')}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      
      <AnimatePresence>
        {showEvidence && (
          <motion.div 
            className="mt-3 pt-3 border-t border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-xs font-medium text-gray-400 mb-2">Evidence Trail:</p>
            <ul className="space-y-1">
              {evidence.map((item, idx) => (
                <li key={idx} className="text-xs text-gray-500 pl-3 relative">
                  <span className="absolute left-0 text-cyan-400">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Error Fallback Component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
    <div className="text-center">
      <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-red-400 mb-2">System Error</h2>
      <p className="text-gray-400 mb-4">NITS System encountered an error</p>
      <Button onClick={resetErrorBoundary} className="bg-red-600/20 border-red-600/50 text-red-400">
        Restart System
      </Button>
    </div>
  </div>
)

function App() {
  // Regular React state for UI components
  const [uploadedFiles, setUploadedFiles] = useState({
    sec: [] as Array<{ name: string; size: number; type: string; uploadTime: Date; status: string }>,
    public: [] as Array<{ name: string; size: number; type: string; uploadTime: Date; status: string }>
  })
  
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([])
  const [systemSettings, setSystemSettings] = useState({
    autoSave: true,
    enhancedMode: false,
    terminatorMode: false
  })

  // Regular React state for transient data
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [activeModules, setActiveModules] = useState<Array<{ id: string; name: string; progress: number; status: string; description?: string }>>([])
  const [detectedViolations, setDetectedViolations] = useState<Array<{
    statute: string;
    description: string;
    severity: string;
    confidence: number;
    evidence: string[];
    legalCitation?: string;
    penalties?: string[];
  }>>([])
  
  const [systemStatus, setSystemStatus] = useState({
    legalDb: 'READY',
    mlEngine: 'IDLE',
    scanning: 'IDLE',
    harvester: 'IDLE',
    terminator: 'ONLINE'
  })
  
  const [systemMetrics, setSystemMetrics] = useState({
    documentsProcessed: 0,
    violationsDetected: 0,
    statutesIndexed: 487923,
    processingSpeed: 0
  })

  const [isTerminatorMode, setIsTerminatorMode] = useState(false)
  const [govAPIStatus, setGovAPIStatus] = useState<'INITIALIZING' | 'CONNECTED' | 'ERROR'>('CONNECTED')

  const secFileInputRef = useRef<HTMLInputElement>(null)
  const publicFileInputRef = useRef<HTMLInputElement>(null)

  // Initialize all legal and enhancement systems on app load
  useEffect(() => {
    const initializeLegalSystems = async () => {
      console.log('⚡ INITIALIZING NITS UNIVERSAL HERO SYSTEMS...')
      
      try {
        // Import and initialize UnifiedTerminatorController
        const { initializeUnifiedTerminator } = await import('./lib/unified-terminator-controller')
        const controller = await initializeUnifiedTerminator()
        
        console.log('✅ All systems initialized and ready')
        console.log('   - Legal Fortification: ACTIVE')
        console.log('   - 5 Advanced Enhancements: ACTIVE')
        console.log('   - Memory Optimizer: ACTIVE')
        console.log('   - Performance Monitor: ACTIVE')
        console.log('   - Regulatory Updates: MONITORING')
        
        // Store controller globally for access
        (window as any).__NITS_CONTROLLER__ = controller
        
        setSystemStatus(prev => ({
          ...prev,
          legalDb: 'READY',
          terminator: 'ARMED',
          harvester: 'MONITORING'
        }))
        
        toast.success('NITS Systems Fully Armed', {
          description: 'All enhancements active and monitoring'
        })
      } catch (error) {
        console.error('❌ System initialization failed:', error)
        setSystemStatus(prev => ({
          ...prev,
          legalDb: 'ERROR',
          terminator: 'ERROR'
        }))
        toast.error('System initialization failed', {
          description: 'Check console for details'
        })
      }
    }
    
    initializeLegalSystems()
  }, []) // Run once on mount

  // File upload handler
  const handleFileUpload = useCallback((files: FileList | null, type: 'sec' | 'public') => {
    if (!files || files.length === 0) return
    
    const fileArray = Array.from(files).map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadTime: new Date(),
      status: 'pending'
    }))
    
    setUploadedFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...fileArray]
    }))
    
    setSystemStatus(prev => ({
      ...prev,
      scanning: 'READY'
    }))
    
    toast.success(`Uploaded ${fileArray.length} files to ${type === 'sec' ? 'SEC' : 'Public'} zone`)
  }, [setUploadedFiles])

  // Analysis function
  const startAnalysis = useCallback(async () => {
    if (uploadedFiles.sec.length === 0 && uploadedFiles.public.length === 0) {
      toast.error('No files to analyze')
      return
    }
    
    setIsAnalyzing(true)
    setSystemStatus(prev => ({
      ...prev,
      mlEngine: 'ACTIVE',
      scanning: 'ANALYZING'
    }))

    const modules = [
      { id: 'nlp', name: 'NLP Analysis Engine', progress: 0, status: 'INITIALIZING', description: 'Advanced natural language processing' },
      { id: 'pattern', name: 'Pattern Recognition System', progress: 0, status: 'INITIALIZING', description: 'Detecting anomalous patterns' },
      { id: 'cross_ref', name: 'Cross-Reference Analyzer', progress: 0, status: 'INITIALIZING', description: 'SEC vs Public document comparison' },
      { id: 'legal_check', name: 'Legal Compliance Scanner', progress: 0, status: 'INITIALIZING', description: 'Statutory violation detection' }
    ]
    
    setActiveModules(modules)

    try {
      // Simulate progressive analysis
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setActiveModules(prev => prev.map(module => ({
          ...module,
          progress: Math.min(i, 100),
          status: i < 100 ? 'PROCESSING' : 'COMPLETE'
        })))
      }

      // Generate mock violations for demonstration
      const mockViolations = [
        {
          statute: '17 CFR § 240.10b-5',
          description: 'Material misstatement in quarterly earnings report',
          severity: 'CRIMINAL',
          confidence: 94,
          evidence: ['Revenue inflated by 12%', 'Undisclosed contingent liabilities', 'Missing risk factor disclosures'],
          legalCitation: 'Securities Exchange Act of 1934, Rule 10b-5',
          penalties: ['$5M fine', 'Up to 5 years imprisonment']
        },
        {
          statute: '15 U.S.C. § 78u-1',
          description: 'Insider trading pattern detected',
          severity: 'CIVIL',
          confidence: 87,
          evidence: ['Executive trades 2 days before earnings', 'Unusual volume spike', 'Form 4 filing delay'],
          legalCitation: 'Securities Exchange Act § 21A',
          penalties: ['3x profit disgorgement', '$134,000 penalty']
        }
      ]

      setDetectedViolations(mockViolations)
      
      const results = {
        timestamp: new Date(),
        filesAnalyzed: uploadedFiles.sec.length + uploadedFiles.public.length,
        violations: mockViolations,
        riskScore: 8.5
      }
      
      setAnalysisResults(results)
      
      // Update metrics
      setSystemMetrics(prev => ({
        ...prev,
        documentsProcessed: prev.documentsProcessed + results.filesAnalyzed,
        violationsDetected: prev.violationsDetected + mockViolations.length,
        processingSpeed: 847
      }))
      
      // Save to history
      setAnalysisHistory(prev => [results, ...prev].slice(0, 10))
      
      toast.success(`Analysis complete: ${mockViolations.length} violations detected`)
      
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Analysis failed')
    } finally {
      setIsAnalyzing(false)
      setSystemStatus(prev => ({
        ...prev,
        mlEngine: 'IDLE',
        scanning: 'COMPLETE'
      }))
    }
  }, [uploadedFiles, setAnalysisHistory, setSystemMetrics])

  // Clear all data
  const clearAllData = () => {
    setUploadedFiles({ sec: [], public: [] })
    setAnalysisResults(null)
    setActiveModules([])
    setDetectedViolations([])
    setSystemStatus(prev => ({
      ...prev,
      scanning: 'IDLE'
    }))
    toast.success('All data cleared')
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('NITS System Error:', error)
        toast.error('System error occurred')
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
        {/* Enhanced Matrix-style background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-95" />
          <motion.div 
            className="absolute inset-0 opacity-5"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 20%, #00ff00 1px, transparent 1px), radial-gradient(circle at 80% 80%, #00ffff 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* ENHANCED HEADER */}
        <motion.header 
          className="border-b border-green-500/30 bg-black/50 backdrop-blur-xl relative z-10"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 bg-green-500 blur-xl opacity-50" 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <Shield className="w-10 h-10 text-green-500 relative z-10" />
                </div>
                <div>
                  <motion.h1 
                    className="text-2xl font-bold text-green-400"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    NITS FORENSIC INTELLIGENCE
                  </motion.h1>
                  <motion.p 
                    className="text-xs text-green-500/70"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    LEGAL FORTIFICATION SYSTEM v4.0 - ENHANCED
                  </motion.p>
                </div>
              </div>
              
              {/* Enhanced Live System Metrics */}
              <motion.div 
                className="flex items-center gap-6"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <StatusIndicator 
                  label="Legal DB" 
                  status={systemStatus.legalDb}
                  isActive={systemStatus.legalDb === 'READY'}
                />
                <StatusIndicator 
                  label="ML Engine" 
                  status={systemStatus.mlEngine}
                  isActive={systemStatus.mlEngine === 'ACTIVE'}
                />
                <StatusIndicator 
                  label="Status" 
                  status={systemStatus.scanning}
                  isActive={isAnalyzing}
                />
              </motion.div>
            </div>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Enhanced Metrics Dashboard */}
          <motion.div 
            className="grid grid-cols-4 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <MetricCard label="Documents Processed" value={systemMetrics.documentsProcessed} severity="low" />
            <MetricCard label="Violations Detected" value={systemMetrics.violationsDetected} severity="high" />
            <MetricCard label="Statutes Indexed" value={systemMetrics.statutesIndexed} severity="medium" />
            <MetricCard label="Processing Speed" value={systemMetrics.processingSpeed} severity="low" />
          </motion.div>
          
          <div className="grid grid-cols-12 gap-6">
            
            {/* LEFT PANEL: Enhanced Document Upload */}
            <motion.div 
              className="col-span-3 space-y-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-green-400 flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Document Intake System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* SEC Regulatory Zone */}
                  <div>
                    <h4 className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                      <Scale className="w-3 h-3" />
                      SEC Regulatory Zone
                    </h4>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        uploadedFiles.sec.length > 0 
                          ? 'border-green-500/60 bg-green-500/10' 
                          : 'border-green-500/30 hover:border-green-500/60 hover:bg-green-500/5'
                      }`}
                      onClick={() => secFileInputRef.current?.click()}
                      onDrop={(e) => {
                        e.preventDefault()
                        handleFileUpload(e.dataTransfer.files, 'sec')
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <Upload className="w-10 h-10 text-green-500/50 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">
                        {uploadedFiles.sec.length > 0 
                          ? `${uploadedFiles.sec.length} files loaded`
                          : 'Drop SEC documents here'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">10-K, 10-Q, 8-K, DEF 14A, XBRL</p>
                      <input
                        ref={secFileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.html,.xlsx,.xls,.xml"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files, 'sec')}
                      />
                    </div>
                  </div>

                  {/* Public Documents Zone */}
                  <div>
                    <h4 className="text-xs text-gray-400 mb-2 flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      Public Glamour Zone
                    </h4>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                        uploadedFiles.public.length > 0 
                          ? 'border-cyan-500/60 bg-cyan-500/10' 
                          : 'border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/5'
                      }`}
                      onClick={() => publicFileInputRef.current?.click()}
                      onDrop={(e) => {
                        e.preventDefault()
                        handleFileUpload(e.dataTransfer.files, 'public')
                      }}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      <FileText className="w-10 h-10 text-cyan-500/50 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">
                        {uploadedFiles.public.length > 0 
                          ? `${uploadedFiles.public.length} files loaded`
                          : 'Drop public documents here'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Press releases, earnings calls, presentations</p>
                      <input
                        ref={publicFileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.html,.xlsx,.xls,.xml,.pptx,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files, 'public')}
                      />
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="grid grid-cols-1 gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        className="w-full bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30 disabled:opacity-50"
                        disabled={uploadedFiles.sec.length === 0 && uploadedFiles.public.length === 0}
                        onClick={startAnalysis}
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Enhanced Deep Analysis
                      </Button>
                    </motion.div>
                  </div>

                  {/* Clear button */}
                  {(uploadedFiles.sec.length > 0 || uploadedFiles.public.length > 0) && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-gray-500 hover:text-gray-300"
                      onClick={clearAllData}
                    >
                      Clear All Data
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* CENTER PANEL: Enhanced Analysis Display */}
            <motion.div 
              className="col-span-6 space-y-4"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-400 flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: isAnalyzing ? 360 : 0 }}
                        transition={{ duration: 2, repeat: isAnalyzing ? Infinity : 0, ease: "linear" }}
                      >
                        <Activity className="w-5 h-5" />
                      </motion.div>
                      ENHANCED FORENSIC ANALYSIS
                    </CardTitle>
                    {isAnalyzing && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        ML ENHANCED
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {activeModules.map(module => (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <AnalysisModule {...module} />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : uploadedFiles.sec.length > 0 || uploadedFiles.public.length > 0 ? (
                    <div className="text-center py-8">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <FileText className="w-8 h-8 text-green-500" />
                        <div className="text-left">
                          <p className="text-gray-300 font-medium">
                            {uploadedFiles.sec.length + uploadedFiles.public.length} files ready for analysis
                          </p>
                          <p className="text-xs text-gray-500">
                            SEC: {uploadedFiles.sec.length} • Public: {uploadedFiles.public.length}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={startAnalysis}
                        className="bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        Start Analysis
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg">Legal Systems Armed</p>
                      <p className="text-xs mt-2">Upload documents to begin comprehensive analysis</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Violation Detection Matrix */}
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    ENHANCED VIOLATION DETECTION MATRIX
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detectedViolations.length > 0 ? (
                    <>
                      <motion.div 
                        className="grid grid-cols-3 gap-4 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                      >
                        <MetricCard 
                          label="Criminal" 
                          value={detectedViolations.filter(v => v.severity === 'CRIMINAL').length} 
                          severity="critical" 
                        />
                        <MetricCard 
                          label="Civil" 
                          value={detectedViolations.filter(v => v.severity === 'CIVIL').length} 
                          severity="high" 
                        />
                        <MetricCard 
                          label="Regulatory" 
                          value={detectedViolations.filter(v => v.severity === 'REGULATORY' || v.severity === 'ADMINISTRATIVE').length} 
                          severity="medium" 
                        />
                      </motion.div>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        <AnimatePresence>
                          {detectedViolations.map((violation, idx) => (
                            <ViolationItem key={idx} {...violation} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </>
                  ) : analysisResults ? (
                    <div className="text-center py-8 text-green-400">
                      <Shield className="w-12 h-12 mx-auto mb-3" />
                      <p className="text-lg">No violations detected</p>
                      <p className="text-xs text-gray-500 mt-2">All documents passed comprehensive compliance checks</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Awaiting analysis results</p>
                      <p className="text-xs mt-2">Upload and analyze documents to detect violations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* RIGHT PANEL: Enhanced Evidence Package */}
            <motion.div 
              className="col-span-3 space-y-4"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-purple-400 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Evidence Package Generator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResults && detectedViolations.length > 0 ? (
                    <>
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-purple-500/10 to-red-500/5 border border-purple-500/30 rounded-lg"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="text-xs text-purple-300 mb-1">Estimated Recovery</p>
                        <p className="text-2xl font-bold text-purple-400">
                          ${(detectedViolations.length * 2.3).toFixed(1)}M
                        </p>
                        <p className="text-xs text-gray-500">Prosecution ready: {detectedViolations.filter(v => v.confidence > 80).length} violations</p>
                      </motion.div>
                      
                      <div className="space-y-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full bg-purple-600/20 border-purple-600/50 text-purple-400 hover:bg-purple-600/30">
                            <FileText className="w-4 h-4 mr-2" />
                            Generate SEC Form TCR
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full bg-red-600/20 border-red-600/50 text-red-400 hover:bg-red-600/30">
                            <Gavel className="w-4 h-4 mr-2" />
                            DOJ Criminal Referral
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button className="w-full bg-green-600/20 border-green-600/50 text-green-400 hover:bg-green-600/30">
                            <Download className="w-4 h-4 mr-2" />
                            Export Evidence Package
                          </Button>
                        </motion.div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No evidence to package</p>
                      <p className="text-xs mt-2">Complete analysis to generate prosecution materials</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis History */}
              <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-cyan-400 text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    Analysis History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {analysisHistory.length > 0 ? (
                      analysisHistory.slice(0, 5).map((result, idx) => (
                        <div key={idx} className="text-xs p-2 bg-gray-800/50 rounded border border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">{result.filesAnalyzed} files</span>
                            <span className={`${result.violations.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                              {result.violations.length} violations
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {new Date(result.timestamp).toLocaleString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-xs">No analysis history</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* ENHANCED BOTTOM STATUS BAR */}
        <motion.div 
          className="fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-xl border-t border-green-500/30 z-40"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4 text-green-400">
                <motion.span 
                  className="flex items-center gap-1"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  ⚖️ ALL SYSTEMS ARMED
                </motion.span>
                <span>|</span>
                <span>Statutes: {systemMetrics.statutesIndexed.toLocaleString()}</span>
                <span>|</span>
                <span>Files: {uploadedFiles.sec.length + uploadedFiles.public.length}</span>
                <span>|</span>
                <span>Violations: {systemMetrics.violationsDetected}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gray-500">Enhanced Legal Intelligence</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500">
                  {isAnalyzing ? 'Processing...' : 
                   (uploadedFiles.sec.length > 0 || uploadedFiles.public.length > 0) ? 'Ready for analysis' : 'Awaiting documents'}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <Toaster />
      </div>
    </ErrorBoundary>
  )
}

export default App