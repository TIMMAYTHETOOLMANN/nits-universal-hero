import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaretDown, CaretUp, Info, Warning, CheckCircle } from '@phosphor-icons/react'

export interface AnalysisModuleProps {
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
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          color: 'bg-green-500/20 text-green-400 border-green-500/50',
          icon: <CheckCircle className="w-3 h-3" />,
          textClass: 'text-green-400'
        }
      case 'ANALYZING':
      case 'PROCESSING':
        return {
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
          icon: <Warning className="w-3 h-3" />,
          textClass: 'text-yellow-400'
        }
      case 'READY':
        return {
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
          icon: <Info className="w-3 h-3" />,
          textClass: 'text-blue-400'
        }
      default:
        return {
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
          icon: <Info className="w-3 h-3" />,
          textClass: 'text-gray-400'
        }
    }
  }

  const statusConfig = getStatusConfig(status)
  
  const getAnalysisTypeIcon = () => {
    switch (analysisType) {
      case 'ml':
        return '🧠'
      case 'pattern':
        return '🔍'
      case 'correlation':
        return '🔗'
      default:
        return '⚖️'
    }
  }

  return (
    <Card className="border border-gray-800 rounded-lg hover:border-green-500/50 transition-all backdrop-blur bg-gray-900/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getAnalysisTypeIcon()}</span>
            <CardTitle className="text-sm font-medium text-gray-300">{name}</CardTitle>
          </div>
          <Badge className={`text-xs flex items-center gap-1 ${statusConfig.color}`}>
            {statusConfig.icon}
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Progress</span>
            <span className={statusConfig.textClass}>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Confidence Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Confidence Level</span>
            <span className="text-purple-400 font-mono">{(confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-700"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Metadata Display */}
        {metadata && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            {metadata.documentsScanned && (
              <div className="flex justify-between">
                <span className="text-gray-500">Documents:</span>
                <span className="text-cyan-400 font-mono">{metadata.documentsScanned}</span>
              </div>
            )}
            {metadata.patternsMatched && (
              <div className="flex justify-between">
                <span className="text-gray-500">Patterns:</span>
                <span className="text-green-400 font-mono">{metadata.patternsMatched}</span>
              </div>
            )}
            {metadata.crossReferences && (
              <div className="flex justify-between">
                <span className="text-gray-500">Cross-refs:</span>
                <span className="text-orange-400 font-mono">{metadata.crossReferences}</span>
              </div>
            )}
            {metadata.timeElapsed && (
              <div className="flex justify-between">
                <span className="text-gray-500">Time:</span>
                <span className="text-purple-400 font-mono">{metadata.timeElapsed}</span>
              </div>
            )}
          </div>
        )}

        {/* Expandable Findings */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="w-full justify-between text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 p-2"
          >
            <span className="flex items-center gap-2">
              {expanded ? <CaretUp className="w-3 h-3" /> : <CaretDown className="w-3 h-3" />}
              {findings.length} findings detected
            </span>
            <Badge variant="outline" className="text-xs">
              {findings.length > 0 ? 'Review' : 'Clear'}
            </Badge>
          </Button>
          
          {expanded && (
            <div className="space-y-2 pl-4 border-l-2 border-cyan-500/30 max-h-32 overflow-y-auto">
              {findings.length > 0 ? (
                findings.map((finding, idx) => (
                  <div key={idx} className="text-xs text-gray-400 p-2 bg-gray-800/30 rounded border border-gray-700">
                    <span className="text-cyan-400 font-mono mr-2">#{idx + 1}</span>
                    {finding}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">No findings to display</div>
              )}
            </div>
          )}
        </div>

        {/* Analysis Status Indicator */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-800">
          <span className="text-gray-500">Analysis Engine:</span>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              status === 'ANALYZING' || status === 'PROCESSING' ? 'bg-yellow-500 animate-pulse' :
              status === 'COMPLETED' ? 'bg-green-500' :
              'bg-gray-500'
            }`} />
            <span className={statusConfig.textClass}>
              {status === 'ANALYZING' || status === 'PROCESSING' ? 'Active' :
               status === 'COMPLETED' ? 'Complete' : 'Standby'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}