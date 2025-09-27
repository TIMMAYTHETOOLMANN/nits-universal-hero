import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Robot, Brain, Target, Lightning, TrendUp, Clock } from '@phosphor-icons/react'

interface TrainingStatus {
  isActive: boolean
  currentPhase: string
  progress: number
  patternsGenerated: number
  lastTrainingTime: string | null
  trainingLog: string[]
}

interface AutonomousPattern {
  id: string
  name: string
  keywords: string[]
  violationType: string
  confidence: number
  performance: number
  generatedAt: string
  isActive: boolean
  source: 'autonomous' | 'manual'
}

interface AutonomousTrainingModuleProps {
  trainingStatus: TrainingStatus
  autonomousPatterns: AutonomousPattern[]
  isTraining: boolean
  onTogglePattern: (id: string) => void
  onDeletePattern: (id: string) => void
  onClearLog: () => void
}

export const AutonomousTrainingModule: React.FC<AutonomousTrainingModuleProps> = ({
  trainingStatus,
  autonomousPatterns,
  isTraining,
  onTogglePattern,
  onDeletePattern,
  onClearLog
}) => {
  const activePatterns = autonomousPatterns.filter(p => p.isActive)
  const recentPatterns = autonomousPatterns
    .filter(p => p.source === 'autonomous')
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, 3)

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-950/20 to-green-950/20 border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Robot size={20} className="text-purple-400" />
          Autonomous Training Engine
          {isTraining && (
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
          )}
        </h3>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {autonomousPatterns.length} patterns
          </Badge>
          <Badge variant="outline" className="text-xs">
            {activePatterns.length} active
          </Badge>
        </div>
      </div>

      {/* Training Status */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Brain size={14} />
            Status: {trainingStatus.currentPhase}
          </span>
          {trainingStatus.isActive && (
            <span className="text-purple-400">{trainingStatus.progress}%</span>
          )}
        </div>

        {trainingStatus.isActive && (
          <Progress 
            value={trainingStatus.progress} 
            className="h-2 training-progress-glow"
          />
        )}

        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Target size={12} />
            Generated: {trainingStatus.patternsGenerated}
          </div>
          <div className="flex items-center gap-1">
            <TrendUp size={12} />
            Success Rate: {Math.round((activePatterns.length / Math.max(autonomousPatterns.length, 1)) * 100)}%
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {trainingStatus.lastTrainingTime 
              ? new Date(trainingStatus.lastTrainingTime).toLocaleTimeString()
              : 'Never'
            }
          </div>
        </div>
      </div>

      {/* Recent Autonomous Patterns */}
      {recentPatterns.length > 0 && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Lightning size={14} className="text-green-400" />
            Recent Auto-Generated Patterns
          </h4>
          
          <div className="space-y-1">
            {recentPatterns.map((pattern) => (
              <div 
                key={pattern.id}
                className="flex items-center justify-between p-2 rounded bg-background/50 border border-border/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={pattern.isActive ? "default" : "secondary"}
                      className="text-xs auto-pattern-badge"
                    >
                      {pattern.violationType}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate">
                      {pattern.name}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Confidence: {Math.round(pattern.confidence * 100)}% | 
                    Keywords: {pattern.keywords.slice(0, 3).join(', ')}
                    {pattern.keywords.length > 3 && '...'}
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant={pattern.isActive ? "default" : "outline"}
                    onClick={() => onTogglePattern(pattern.id)}
                    className="h-6 px-2 text-xs"
                  >
                    {pattern.isActive ? 'Active' : 'Inactive'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDeletePattern(pattern.id)}
                    className="h-6 px-2 text-xs"
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Log */}
      {trainingStatus.trainingLog.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Training Log</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={onClearLog}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
          
          <div className="bg-background/50 rounded border border-border/50 p-2 max-h-24 overflow-y-auto">
            {trainingStatus.trainingLog.slice(-5).map((log, index) => (
              <div key={index} className="text-xs text-muted-foreground font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Training Summary */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>Autonomous Intelligence Status:</span>
            <Badge 
              variant={isTraining ? "default" : "outline"}
              className="text-xs"
            >
              {isTraining ? 'Learning' : 'Ready'}
            </Badge>
          </div>
          <div className="mt-1 text-xs">
            Next training will occur automatically after analysis completion
          </div>
        </div>
      </div>
    </Card>
  )
}