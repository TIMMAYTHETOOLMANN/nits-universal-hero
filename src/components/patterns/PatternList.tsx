import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Eye, Flask, Trash, Robot, CaretDown, Gear } from '@phosphor-icons/react'
import { CustomPattern } from '../../types/patterns'
import { formatRiskLevel } from '../../utils/formatters'

interface PatternListProps {
  patterns: CustomPattern[]
  testingPattern: string | null
  onTogglePattern: (id: string) => void
  onTestPattern: (id: string) => void
  onDeletePattern: (id: string) => void
  className?: string
}

export const PatternList: React.FC<PatternListProps> = ({
  patterns,
  testingPattern,
  onTogglePattern,
  onTestPattern,
  onDeletePattern,
  className = ''
}) => {
  if (patterns.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Custom Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No custom patterns created yet. Create your first pattern to enhance analysis accuracy.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Custom Patterns ({patterns.length})</span>
          <div className="text-sm text-muted-foreground">
            {patterns.filter(p => p.isActive).length} active
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patterns.map((pattern, index) => (
            <Collapsible key={pattern.id}>
              <div className="border rounded-lg p-3">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CaretDown size={16} className="text-muted-foreground" />
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{pattern.name}</span>
                          {pattern.name.startsWith('[AUTO]') && (
                            <Badge variant="outline" className="text-xs">
                              <Robot size={10} className="mr-1" />
                              AUTO
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {pattern.description.split('\n')[0]}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant={pattern.isActive ? "default" : "outline"}
                        className={formatRiskLevel(pattern.severity).color}
                      >
                        {formatRiskLevel(pattern.severity).label}
                      </Badge>
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-3 pt-3 border-t">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium mb-1">Description:</div>
                      <div className="text-muted-foreground whitespace-pre-wrap">
                        {pattern.description}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="font-medium mb-1">Category:</div>
                        <Badge variant="outline">{pattern.category}</Badge>
                      </div>
                      <div>
                        <div className="font-medium mb-1">Confidence:</div>
                        <div>{Math.round(pattern.confidence * 100)}%</div>
                      </div>
                    </div>
                    
                    {pattern.keywords.length > 0 && (
                      <div className="text-sm">
                        <div className="font-medium mb-1">Keywords:</div>
                        <div className="flex flex-wrap gap-1">
                          {pattern.keywords.map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {pattern.rules.length > 0 && (
                      <div className="text-sm">
                        <div className="font-medium mb-1">Rules:</div>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {pattern.rules.map((rule, i) => (
                            <li key={i}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {pattern.testResults.totalTests > 0 && (
                      <div className="text-sm">
                        <div className="font-medium mb-1">Test Results:</div>
                        <div className="text-muted-foreground">
                          Success Rate: {pattern.testResults.successRate}% 
                          ({pattern.testResults.totalTests} tests, {pattern.testResults.falsePositives} false positives)
                        </div>
                        {pattern.testResults.lastTestDate && (
                          <div className="text-xs text-muted-foreground">
                            Last tested: {new Date(pattern.testResults.lastTestDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTogglePattern(pattern.id)}
                        className={pattern.isActive ? "text-primary" : "text-muted-foreground"}
                      >
                        <Eye size={12} className="mr-1" />
                        {pattern.isActive ? 'Active' : 'Inactive'}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTestPattern(pattern.id)}
                        disabled={testingPattern === pattern.id}
                      >
                        {testingPattern === pattern.id ? (
                          <Gear size={12} className="mr-1 animate-spin" />
                        ) : (
                          <Flask size={12} className="mr-1" />
                        )}
                        Test
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePattern(pattern.id)}
                        className="text-destructive hover:text-destructive ml-auto"
                      >
                        <Trash size={12} />
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}