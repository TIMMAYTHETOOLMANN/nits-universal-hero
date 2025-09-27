export const SUPPORTED_FORMATS = ['.pdf', '.html', '.xlsx', '.xls', '.xml', '.pptx', '.docx']
export const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export const ANALYSIS_PHASES = [
  { name: 'Deep document ingestion and multi-layered classification', progress: 12 },
  { name: 'Intensive AI-powered natural language processing', progress: 25 },
  { name: 'Exhaustive custom pattern matching and validation', progress: 38 },
  { name: 'Aggressive cross-document triangulation analysis', progress: 52 },
  { name: 'Maximum-intensity pattern recognition and risk amplification', progress: 68 },
  { name: 'Comprehensive violation profiling and penalty maximization', progress: 82 },
  { name: 'Executive behavior analysis and multi-angle assessment', progress: 95 },
  { name: 'Final compilation and penalty calculation optimization', progress: 100 }
]

export const DEFAULT_PATTERN_CONFIDENCE = 0.7
export const DEFAULT_PATTERN_SEVERITY = 'medium' as const