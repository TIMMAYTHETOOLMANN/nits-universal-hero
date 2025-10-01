import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCommandTracking } from '../../hooks/useCommandTracking'
import { 
  Terminal, 
  Lightning, 
  Brain, 
  Package, 
  FileText, 
  Scales,
  Eye,
  Activity,
  Calculator,
  TrendUp,
  CaretUp,
  CaretDown
} from '@phosphor-icons/react'

interface ShortcutGuideProps {
  className?: string
}

export const ShortcutGuide: React.FC<ShortcutGuideProps> = ({ className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { commandStats, getCommandEfficiency } = useCommandTracking()
  
  const efficiency = getCommandEfficiency()

  const shortcuts = [
    { 
      key: '⌘K', 
      action: 'Command Palette', 
      icon: <Terminal className="w-3 h-3" />,
      category: 'system'
    },
    { 
      key: '⌘S', 
      action: 'Quick Scan', 
      icon: <Lightning className="w-3 h-3" />,
      category: 'analysis'
    },
    { 
      key: '⌘D', 
      action: 'Deep Analysis', 
      icon: <Brain className="w-3 h-3" />,
      category: 'analysis'
    },
    { 
      key: '⌘E', 
      action: 'Export Evidence', 
      icon: <Package className="w-3 h-3" />,
      category: 'export'
    },
    { 
      key: '⌘T', 
      action: 'SEC Form TCR', 
      icon: <FileText className="w-3 h-3" />,
      category: 'export'
    },
    { 
      key: '⌘J', 
      action: 'DOJ Referral', 
      icon: <Scales className="w-3 h-3" />,
      category: 'export'
    },
    { 
      key: '⌘1', 
      action: 'Command Center', 
      icon: <Eye className="w-3 h-3" />,
      category: 'view'
    },
    { 
      key: '⌘2', 
      action: 'Advanced Charts', 
      icon: <Activity className="w-3 h-3" />,
      category: 'view'
    },
    { 
      key: '⌘3', 
      action: 'Financial Matrix', 
      icon: <Calculator className="w-3 h-3" />,
      category: 'view'
    },
    { 
      key: '⌘4', 
      action: 'Analysis Results', 
      icon: <TrendUp className="w-3 h-3" />,
      category: 'view'
    }
  ]

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'text-green-400'
      case 'export': return 'text-purple-400'
      case 'system': return 'text-cyan-400'
      case 'view': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const visibleShortcuts = isExpanded ? shortcuts : shortcuts.slice(0, 4)

  return (
    <Card className={`bg-gray-900/50 border-gray-800 backdrop-blur ${className}`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-cyan-400 uppercase tracking-wider">
            Keyboard Shortcuts
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0 text-gray-500 hover:text-gray-300"
          >
            {isExpanded ? <CaretUp className="w-3 h-3" /> : <CaretDown className="w-3 h-3" />}
          </Button>
        </div>
        
        <div className="space-y-2">
          {visibleShortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={getCategoryColor(shortcut.category)}>
                  {shortcut.icon}
                </div>
                <span className="text-xs text-gray-300">{shortcut.action}</span>
              </div>
              <kbd className="command-shortcut text-gray-400">
                {shortcut.key}
              </kbd>
            </div>
          ))}
          
          {!isExpanded && shortcuts.length > 4 && (
            <div className="text-center pt-1">
              <span className="text-xs text-gray-500">
                +{shortcuts.length - 4} more shortcuts
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50 text-xs">
              Pro Tip
            </Badge>
            <span className="text-xs text-gray-500">
              Press ⌘K for all commands
            </span>
          </div>
          {commandStats && commandStats.totalCommands > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                Commands used: {commandStats.totalCommands}
              </span>
              <span className={`${
                efficiency.shortcutRatio >= 70 ? 'text-green-400' :
                efficiency.shortcutRatio >= 40 ? 'text-yellow-400' : 'text-gray-400'
              }`}>
                Efficiency: {efficiency.shortcutRatio}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}