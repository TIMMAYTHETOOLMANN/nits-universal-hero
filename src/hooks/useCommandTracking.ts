import { useState, useCallback } from 'react'
import { useKV } from '@github/spark/hooks'

interface CommandUsage {
  commandId: string
  timestamp: string
  context: string
}

interface CommandStats {
  totalCommands: number
  mostUsed: string[]
  recentCommands: CommandUsage[]
  shortcuts: number
  palette: number
}

export const useCommandTracking = () => {
  const [commandStats, setCommandStats] = useKV<CommandStats>('command-stats', {
    totalCommands: 0,
    mostUsed: [],
    recentCommands: [],
    shortcuts: 0,
    palette: 0
  })

  const trackCommand = useCallback((commandId: string, source: 'shortcut' | 'palette', context = '') => {
    const usage: CommandUsage = {
      commandId,
      timestamp: new Date().toISOString(),
      context
    }

    setCommandStats(current => {
      if (!current) {
        return {
          totalCommands: 1,
          mostUsed: [commandId],
          recentCommands: [usage],
          shortcuts: source === 'shortcut' ? 1 : 0,
          palette: source === 'palette' ? 1 : 0
        }
      }

      const newStats: CommandStats = {
        totalCommands: current.totalCommands + 1,
        shortcuts: current.shortcuts + (source === 'shortcut' ? 1 : 0),
        palette: current.palette + (source === 'palette' ? 1 : 0),
        recentCommands: [usage, ...current.recentCommands].slice(0, 10),
        mostUsed: []
      }
      
      // Update most used commands
      const commandCounts = current.recentCommands.reduce((acc, cmd) => {
        acc[cmd.commandId] = (acc[cmd.commandId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      commandCounts[commandId] = (commandCounts[commandId] || 0) + 1
      
      newStats.mostUsed = Object.entries(commandCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([cmd]) => cmd)
      
      return newStats
    })
  }, [setCommandStats])

  const getCommandEfficiency = useCallback(() => {
    if (!commandStats) return { shortcutRatio: 0, averagePerSession: 0 }
    
    const total = commandStats.totalCommands
    const shortcutRatio = total > 0 ? (commandStats.shortcuts / total) * 100 : 0
    
    return {
      shortcutRatio: Math.round(shortcutRatio),
      averagePerSession: Math.round(total / Math.max(1, commandStats.recentCommands.length))
    }
  }, [commandStats])

  return {
    commandStats,
    trackCommand,
    getCommandEfficiency
  }
}