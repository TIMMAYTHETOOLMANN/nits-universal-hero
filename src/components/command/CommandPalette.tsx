import React, { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useCommandTracking } from '../../hooks/useCommandTracking'
import { 
  MagnifyingGlass as Search, 
  Lightning, 
  Brain, 
  Package, 
  FileText, 
  Scales, 
  Database, 
  Robot,
  Activity,
  Calculator,
  Shield,
  Upload,
  Download,
  Trash as Trash2,
  Terminal,
  ClockCounterClockwise as History,
  TrendUp,
  Eye,
  Gear as Settings,
  ArrowClockwise as RefreshCw
} from '@phosphor-icons/react'

interface Command {
  id: string
  label: string
  description: string
  shortcut: string
  category: 'analysis' | 'export' | 'system' | 'view' | 'training'
  icon: React.ReactNode
  action: () => void
  disabled?: boolean
  badge?: string
}

interface CommandPaletteProps {
  onQuickScan: () => void
  onDeepAnalysis: () => void
  onExportEvidence: (format: string) => void
  onGenerateTCR: () => void
  onCreateDOJReferral: () => void
  onUpdateDatabase: () => void
  onClearFiles: () => void
  onClearConsole: () => void
  onExportConsole: () => void
  onToggleTraining: () => void
  onRecalculatePenalties: () => void
  onSwitchTab: (tab: string) => void
  canExecuteAnalysis: boolean
  hasResults: boolean
  hasPenalties: boolean
  isAnalyzing: boolean
  isTraining: boolean
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onQuickScan,
  onDeepAnalysis,
  onExportEvidence,
  onGenerateTCR,
  onCreateDOJReferral,
  onUpdateDatabase,
  onClearFiles,
  onClearConsole,
  onExportConsole,
  onToggleTraining,
  onRecalculatePenalties,
  onSwitchTab,
  canExecuteAnalysis,
  hasResults,
  hasPenalties,
  isAnalyzing,
  isTraining
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  const { trackCommand, getCommandEfficiency } = useCommandTracking()

  const commands: Command[] = [
    // Analysis Commands
    {
      id: 'quick-scan',
      label: 'Quick Scan Documents',
      description: 'Run rapid forensic analysis on uploaded documents',
      shortcut: '⌘S',
      category: 'analysis',
      icon: <Lightning className="w-4 h-4" />,
      action: () => onQuickScan(),
      disabled: !canExecuteAnalysis || isAnalyzing,
      badge: isAnalyzing ? 'Running...' : undefined
    },
    {
      id: 'deep-analysis',
      label: 'Deep Forensic Analysis',
      description: 'Execute comprehensive violation detection with ML enhancement',
      shortcut: '⌘D',
      category: 'analysis',
      icon: <Brain className="w-4 h-4" />,
      action: () => onDeepAnalysis(),
      disabled: !canExecuteAnalysis || isAnalyzing,
      badge: isAnalyzing ? 'Processing...' : undefined
    },
    {
      id: 'recalc-penalties',
      label: 'Recalculate Penalties',
      description: 'Refresh financial penalty calculations',
      shortcut: '⌘R',
      category: 'analysis',
      icon: <Calculator className="w-4 h-4" />,
      action: () => onRecalculatePenalties(),
      disabled: !hasResults
    },

    // Export Commands
    {
      id: 'export-evidence',
      label: 'Export Evidence Package',
      description: 'Generate complete evidence package for legal proceedings',
      shortcut: '⌘E',
      category: 'export',
      icon: <Package className="w-4 h-4" />,
      action: () => onExportEvidence('complete'),
      disabled: !hasResults
    },
    {
      id: 'generate-tcr',
      label: 'Generate SEC Form TCR',
      description: 'Create SEC Trading and Capital-Raising report',
      shortcut: '⌘T',
      category: 'export',
      icon: <FileText className="w-4 h-4" />,
      action: () => onGenerateTCR(),
      disabled: !hasPenalties
    },
    {
      id: 'doj-referral',
      label: 'Create DOJ Criminal Referral',
      description: 'Generate Department of Justice criminal referral package',
      shortcut: '⌘J',
      category: 'export',
      icon: <Scales className="w-4 h-4" />,
      action: () => onCreateDOJReferral(),
      disabled: !hasResults,
      badge: 'Criminal'
    },
    {
      id: 'export-txt',
      label: 'Export Text Report',
      description: 'Export analysis results as text file',
      shortcut: '⌘⇧T',
      category: 'export',
      icon: <Download className="w-4 h-4" />,
      action: () => onExportEvidence('txt'),
      disabled: !hasResults
    },

    // System Commands
    {
      id: 'update-database',
      label: 'Update Legal Database',
      description: 'Refresh regulatory database with latest statutes',
      shortcut: '⌘U',
      category: 'system',
      icon: <Database className="w-4 h-4" />,
      action: () => onUpdateDatabase(),
      badge: 'System'
    },
    {
      id: 'toggle-training',
      label: 'Toggle Autonomous Training',
      description: 'Enable/disable ML pattern training system',
      shortcut: '⌘A',
      category: 'system',
      icon: <Robot className="w-4 h-4" />,
      action: () => onToggleTraining(),
      badge: isTraining ? 'Active' : 'Inactive'
    },
    {
      id: 'clear-files',
      label: 'Clear All Documents',
      description: 'Remove all uploaded documents from system',
      shortcut: '⌘⇧C',
      category: 'system',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => onClearFiles(),
      badge: 'Destructive'
    },
    {
      id: 'clear-console',
      label: 'Clear System Console',
      description: 'Clear system console output log',
      shortcut: '⌘⇧L',
      category: 'system',
      icon: <Terminal className="w-4 h-4" />,
      action: () => onClearConsole()
    },
    {
      id: 'export-console',
      label: 'Export Console Log',
      description: 'Export system console log for debugging',
      shortcut: '⌘⇧E',
      category: 'system',
      icon: <History className="w-4 h-4" />,
      action: () => onExportConsole()
    },

    // View Commands
    {
      id: 'view-dashboard',
      label: 'Command Center',
      description: 'Switch to main intelligence dashboard',
      shortcut: '⌘1',
      category: 'view',
      icon: <Eye className="w-4 h-4" />,
      action: () => onSwitchTab('dashboard')
    },
    {
      id: 'view-visualizations',
      label: 'Advanced Charts',
      description: 'View enhanced data visualizations',
      shortcut: '⌘2',
      category: 'view',
      icon: <Activity className="w-4 h-4" />,
      action: () => onSwitchTab('visualizations'),
      disabled: !hasResults
    },
    {
      id: 'view-financial',
      label: 'Financial Matrix',
      description: 'Access penalty calculation matrix',
      shortcut: '⌘3',
      category: 'view',
      icon: <Calculator className="w-4 h-4" />,
      action: () => onSwitchTab('financial'),
      disabled: !hasPenalties
    },
    {
      id: 'view-results',
      label: 'Analysis Results',
      description: 'View detailed analysis results',
      shortcut: '⌘4',
      category: 'view',
      icon: <TrendUp className="w-4 h-4" />,
      action: () => onSwitchTab('results'),
      disabled: !hasResults
    }
  ]

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  )

  const executeCommand = useCallback((command: Command, source: 'shortcut' | 'palette' = 'palette') => {
    if (!command.disabled) {
      trackCommand(command.id, source, `${command.category}:${command.label}`)
      command.action()
      setIsOpen(false)
      setSearch('')
      setSelectedIndex(0)
    }
  }, [trackCommand])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault()
      setIsOpen(true)
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        setIsOpen(false)
        setSearch('')
        setSelectedIndex(0)
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex])
        }
        break
    }
  }, [isOpen, filteredCommands, selectedIndex, executeCommand])

  // Global keyboard shortcuts
  const handleGlobalShortcuts = useCallback((e: KeyboardEvent) => {
    if (!e.metaKey) return

    const shortcutMap: Record<string, Command | undefined> = {
      's': commands.find(cmd => cmd.id === 'quick-scan'),
      'd': commands.find(cmd => cmd.id === 'deep-analysis'),
      'e': commands.find(cmd => cmd.id === 'export-evidence'),
      't': commands.find(cmd => cmd.id === 'generate-tcr'),
      'j': commands.find(cmd => cmd.id === 'doj-referral'),
      'u': commands.find(cmd => cmd.id === 'update-database'),
      'a': commands.find(cmd => cmd.id === 'toggle-training'),
      'r': commands.find(cmd => cmd.id === 'recalc-penalties'),
      '1': commands.find(cmd => cmd.id === 'view-dashboard'),
      '2': commands.find(cmd => cmd.id === 'view-visualizations'),
      '3': commands.find(cmd => cmd.id === 'view-financial'),
      '4': commands.find(cmd => cmd.id === 'view-results')
    }

    // Handle shift combinations
    if (e.shiftKey) {
      const shiftShortcutMap: Record<string, Command | undefined> = {
        'c': commands.find(cmd => cmd.id === 'clear-files'),
        'l': commands.find(cmd => cmd.id === 'clear-console'),
        'e': commands.find(cmd => cmd.id === 'export-console'),
        't': commands.find(cmd => cmd.id === 'export-txt')
      }
      
      const command = shiftShortcutMap[e.key.toLowerCase()]
      if (command && !command.disabled) {
        e.preventDefault()
        trackCommand(command.id, 'shortcut', `global-shift:${command.label}`)
        command.action()
      }
      return
    }

    const command = shortcutMap[e.key.toLowerCase()]
    if (command && !command.disabled) {
      e.preventDefault()
      trackCommand(command.id, 'shortcut', `global:${command.label}`)
      command.action()
    }
  }, [commands])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keydown', handleGlobalShortcuts)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keydown', handleGlobalShortcuts)
    }
  }, [handleKeyDown, handleGlobalShortcuts, trackCommand])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'text-green-400'
      case 'export': return 'text-purple-400'
      case 'system': return 'text-cyan-400'
      case 'view': return 'text-yellow-400'
      case 'training': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'analysis': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'export': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'system': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
      case 'view': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'training': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, Command[]>)

  return (
    <>
      {/* Command Palette Trigger Hint */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 border border-gray-700 rounded-lg text-gray-400 text-xs hover:text-gray-300 hover:border-gray-600 transition-all backdrop-blur"
        >
          <Terminal className="w-3 h-3" />
          <kbd className="bg-gray-800 px-1 py-0.5 rounded text-xs">⌘K</kbd>
          <span>Command</span>
        </button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900/95 border-gray-800 text-gray-300 max-w-2xl backdrop-blur-xl">
          {/* Search Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent outline-none text-gray-300 placeholder-gray-600 text-sm"
              autoFocus
            />
            <Badge className="bg-gray-800/50 text-gray-500 text-xs">
              {filteredCommands.length} commands
            </Badge>
          </div>

          {/* Commands List */}
          <div className="py-2 max-h-96 overflow-y-auto">
            {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category} className="mb-4">
                <h3 className={`text-xs font-medium mb-2 px-3 uppercase tracking-wider ${getCategoryColor(category)}`}>
                  {category}
                </h3>
                <div className="space-y-1">
                  {categoryCommands.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd)
                    const isSelected = globalIndex === selectedIndex
                    
                    return (
                      <button
                        key={cmd.id}
                        onClick={() => executeCommand(cmd)}
                        disabled={cmd.disabled}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-left ${
                          isSelected 
                            ? 'bg-gray-800 border border-gray-700' 
                            : 'hover:bg-gray-800/50'
                        } ${cmd.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 ${getCategoryColor(cmd.category)}`}>
                            {cmd.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-300 truncate">
                                {cmd.label}
                              </span>
                              {cmd.badge && (
                                <Badge className={`text-xs ${
                                  cmd.badge === 'Running...' || cmd.badge === 'Processing...' 
                                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                                    : cmd.badge === 'Criminal' || cmd.badge === 'Destructive'
                                    ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                    : cmd.badge === 'Active'
                                    ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                    : 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                                }`}>
                                  {cmd.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                              {cmd.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={`text-xs ${getCategoryBadgeColor(cmd.category)}`}>
                            {cmd.category}
                          </Badge>
                          <kbd className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700 font-mono">
                            {cmd.shortcut}
                          </kbd>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
            
            {filteredCommands.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No commands found for "{search}"</p>
                <p className="text-xs mt-1">Try searching for analysis, export, or system commands</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-800 px-1 py-0.5 rounded">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-800 px-1 py-0.5 rounded">↵</kbd>
                  Execute
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-800 px-1 py-0.5 rounded">Esc</kbd>
                  Close
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <span>Shortcut Efficiency: {getCommandEfficiency().shortcutRatio}%</span>
                <span>•</span>
                <span>NITS Command System v3.0</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}