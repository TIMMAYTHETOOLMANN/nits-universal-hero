import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Pause, Play } from '@phosphor-icons/react'

interface AnalysisProgressProps {
  isAnalyzing: boolean
  progress: number
  phase: string
  onExecute: () => void
  onCancel?: () => void
  canExecute: boolean
  buttonText?: string
  className?: string
}

export const AnalysisProgress: React.FC<AnalysisProgressProps> = ({
  isAnalyzing,
  progress,
  phase,
  onExecute,
  onCancel,
  canExecute,
  buttonText = 'Execute AI-Powered Forensic Analysis',
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain size={20} />
          Analysis Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={onExecute}
            disabled={isAnalyzing || !canExecute}
            className="flex-1"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Brain size={16} className="mr-2 animate-pulse" />
                Analysis in Progress...
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                {buttonText}
              </>
            )}
          </Button>
          
          {onCancel && isAnalyzing && (
            <Button 
              variant="outline" 
              onClick={onCancel}
              size="lg"
            >
              <Pause size={16} />
            </Button>
          )}
        </div>

        {isAnalyzing && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground truncate pr-2">
                {phase || 'Initializing analysis...'}
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress 
              value={progress} 
              className="analysis-progress"
            />
            <div className="text-xs text-muted-foreground">
              AI-powered forensic analysis engine processing documents...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}