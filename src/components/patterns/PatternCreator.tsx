import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash } from '@phosphor-icons/react'
import { CustomPattern, PatternCategory } from '../../types/patterns'
import { RiskLevel } from '../../types/common'

interface PatternCreatorProps {
  newPattern: Partial<CustomPattern>
  onPatternChange: (pattern: Partial<CustomPattern>) => void
  onCreatePattern: () => Promise<{ success: boolean, message: string }>
  className?: string
}

const PATTERN_CATEGORIES: { value: PatternCategory; label: string }[] = [
  { value: 'insider-trading', label: 'Insider Trading' },
  { value: 'esg-greenwashing', label: 'ESG Greenwashing' },
  { value: 'financial-engineering', label: 'Financial Engineering' },
  { value: 'disclosure-gap', label: 'Disclosure Gap' },
  { value: 'litigation-risk', label: 'Litigation Risk' },
  { value: 'temporal-anomaly', label: 'Temporal Anomaly' },
  { value: 'custom', label: 'Custom' }
]

const SEVERITY_LEVELS: { value: RiskLevel; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
]

export const PatternCreator: React.FC<PatternCreatorProps> = ({
  newPattern,
  onPatternChange,
  onCreatePattern,
  className = ''
}) => {
  const handleAddKeyword = () => {
    const keywords = [...(newPattern.keywords || [])]
    keywords.push('')
    onPatternChange({ ...newPattern, keywords })
  }

  const handleRemoveKeyword = (index: number) => {
    const keywords = [...(newPattern.keywords || [])]
    keywords.splice(index, 1)
    onPatternChange({ ...newPattern, keywords })
  }

  const handleKeywordChange = (index: number, value: string) => {
    const keywords = [...(newPattern.keywords || [])]
    keywords[index] = value
    onPatternChange({ ...newPattern, keywords })
  }

  const handleAddRule = () => {
    const rules = [...(newPattern.rules || [])]
    rules.push('')
    onPatternChange({ ...newPattern, rules })
  }

  const handleRemoveRule = (index: number) => {
    const rules = [...(newPattern.rules || [])]
    rules.splice(index, 1)
    onPatternChange({ ...newPattern, rules })
  }

  const handleRuleChange = (index: number, value: string) => {
    const rules = [...(newPattern.rules || [])]
    rules[index] = value
    onPatternChange({ ...newPattern, rules })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await onCreatePattern()
    if (result.success) {
      // Form will be reset by the parent component
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create Custom Pattern</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pattern Name</label>
              <Input
                value={newPattern.name || ''}
                onChange={(e) => onPatternChange({ ...newPattern, name: e.target.value })}
                placeholder="Enter pattern name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select
                value={newPattern.category || 'custom'}
                onValueChange={(value: PatternCategory) => onPatternChange({ ...newPattern, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PATTERN_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={newPattern.description || ''}
              onChange={(e) => onPatternChange({ ...newPattern, description: e.target.value })}
              placeholder="Describe what this pattern detects"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Severity</label>
              <Select
                value={newPattern.severity || 'medium'}
                onValueChange={(value: RiskLevel) => onPatternChange({ ...newPattern, severity: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      <Badge className={level.color} variant="secondary">
                        {level.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confidence</label>
              <Input
                type="number"
                min="0.1"
                max="1.0"
                step="0.1"
                value={newPattern.confidence || 0.7}
                onChange={(e) => onPatternChange({ ...newPattern, confidence: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Keywords</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddKeyword}>
                <Plus size={12} />
              </Button>
            </div>
            <div className="space-y-2">
              {(newPattern.keywords || []).map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={keyword}
                    onChange={(e) => handleKeywordChange(index, e.target.value)}
                    placeholder="Enter keyword"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveKeyword(index)}
                  >
                    <Trash size={12} />
                  </Button>
                </div>
              ))}
              {(newPattern.keywords || []).length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No keywords added. Click + to add keywords.
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Rules</label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRule}>
                <Plus size={12} />
              </Button>
            </div>
            <div className="space-y-2">
              {(newPattern.rules || []).map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={rule}
                    onChange={(e) => handleRuleChange(index, e.target.value)}
                    placeholder="Enter rule"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveRule(index)}
                  >
                    <Trash size={12} />
                  </Button>
                </div>
              ))}
              {(newPattern.rules || []).length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No rules added. Click + to add rules.
                </div>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={!newPattern.name || !newPattern.description}
          >
            Create Pattern
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}