import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CaretUp, CaretDown, Info, Lightning, Eye } from '@phosphor-icons/react'

interface AnalysisModuleProps {
  name: string
  progress: number
  status: string
  confidence: number
  findings: string[]
  analysisType?: 'forensic' | 'ml' | 'pattern' | 'correlation'
  metadata?: {
    documentsScanned?: number
    patternsMatched?: number
    crossReferences?: number
    timeElapsed?: string
  }
}

export type { AnalysisModuleProps }

export const EnhancedAnalysisModule: React.FC<AnalysisModuleProps> = ({
  name,
  progress,
  status,
  confidence,
  findings,
  analysisType = 'forensic',
  metadata
}) => {
  const [expanded, setExpanded] = useState(false)
  const [showMetadata, setShowMetadata] = useState(false)

  const getStatusConfig = () => {
    switch (status) {
      case 'COMPLETED':
        return {
          bgClass: 'bg-green-500/20',
          textClass: 'text-green-400',
          borderClass: 'border-green-500/50',
          glowClass: 'shadow-green-500/20'
        }
      case 'ANALYZING':
      case 'PROCESSING':
        return {
          bgClass: 'bg-yellow-500/20',
          textClass: 'text-yellow-400',
          borderClass: 'border-yellow-500/50',
          glowClass: 'shadow-yellow-500/20'
        }
      case 'READY':
        return {
          bgClass: 'bg-blue-500/20',
          textClass: 'text-blue-400',
          borderClass: 'border-blue-500/50',
          glowClass: 'shadow-blue-500/20'
        }
      default:
        return {
          bgClass: 'bg-gray-500/20',
          textClass: 'text-gray-400',
          borderClass: 'border-gray-500/50',
          glowClass: 'shadow-gray-500/20'
        }
    }
  }

  const statusConfig = getStatusConfig()

  const getAnalysisTypeIcon = () => {
    switch (analysisType) {
      case 'ml':
        return <Lightning className="w-4 h-4" />
      case 'pattern':
        return <Eye className="w-4 h-4" />
      case 'correlation':
        return <Info className="w-4 h-4" />
      default:
        return <Lightning className="w-4 h-4" />
    }
  }

  const formatProgress = (value: number) => {
    return Math.min(100, Math.max(0, value))
  }

  return (
    <div className={`border ${statusConfig.borderClass} rounded-lg p-4 hover:${statusConfig.borderClass} hover:shadow-lg hover:${statusConfig.glowClass} transition-all duration-300 group`}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full ${statusConfig.bgClass}`}>
            {getAnalysisTypeIcon()}
          </div>
          <h3 className="text-sm font-medium text-gray-300 group-hover:text-gray-200 transition-colors">
            {name}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${statusConfig.bgClass} ${statusConfig.textClass} border-transparent`}>
            {status}
          </Badge>
          {metadata && (
            <button
              onClick={() => setShowMetadata(!showMetadata)}
              className="text-gray-500 hover:text-gray-300 transition-colors"
              title="View metadata"
            >
              <Info className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      {showMetadata && metadata && (
        <div className="mb-3 p-2 bg-gray-800/50 rounded border border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {metadata.documentsScanned && (
              <div className="text-gray-400">
                <span className="text-gray-500">Docs:</span> {metadata.documentsScanned}
              </div>
            )}
            {metadata.patternsMatched && (
              <div className="text-gray-400">
                <span className="text-gray-500">Patterns:</span> {metadata.patternsMatched}
              </div>
            )}
            {metadata.crossReferences && (
              <div className="text-gray-400">
                <span className="text-gray-500">Cross-refs:</span> {metadata.crossReferences}
              </div>
            )}
            {metadata.timeElapsed && (
              <div className="text-gray-400">
                <span className="text-gray-500">Time:</span> {metadata.timeElapsed}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Progress Bar */}
      <div className="relative mb-3">
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full transition-all duration-500 relative"
            style={{ width: `${formatProgress(progress)}%` }}
          >
            {/* Animated pulse overlay for active analysis */}
            {status === 'ANALYZING' && (
              <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
            )}
            {/* Shimmer effect for completed analysis */}
            {status === 'COMPLETED' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-gray-500">
            Progress: <span className={statusConfig.textClass}>{formatProgress(progress)}%</span>
          </span>
          <span className="text-gray-500">
            Confidence: <span className="text-cyan-400">{(confidence * 100).toFixed(0)}%</span>
          </span>
        </div>
      </div>

      {/* Expandable Findings Section */}
      <div className="space-y-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors group"
        >
          {expanded ? <CaretUp className="w-3 h-3" /> : <CaretDown className="w-3 h-3" />}
          <span className="group-hover:underline">{findings.length} findings</span>
          {findings.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full text-xs">
              {findings.length}
            </span>
          )}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 pl-4 border-l-2 border-cyan-500/30 animate-fadeIn">
            {findings.length > 0 ? (
              findings.map((finding, idx) => (
                <div key={idx} className="flex items-start gap-2 group/item">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-xs text-gray-400 group-hover/item:text-gray-300 transition-colors leading-relaxed">
                    {finding}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 italic">No findings to display</p>
            )}
          </div>
        )}
      </div>

      {/* Analysis Type Indicator */}
      <div className="mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Analysis Type:</span>
          <span className={`${statusConfig.textClass} capitalize font-medium`}>
            {analysisType}
          </span>
        </div>
      </div>
    </div>
  )
}

export default EnhancedAnalysisModule