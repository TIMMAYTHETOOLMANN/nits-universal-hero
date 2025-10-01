import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Warning, 
  WarningCircle, 
  Info, 
  X, 
  Shield,
  Activity,
  Clock,
  Database,
  CheckCircle
} from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface Alert {
  id: string
  type: 'critical' | 'warning' | 'info' | 'success'
  category: 'violation' | 'system' | 'analysis' | 'training' | 'database'
  title: string
  message: string
  details?: string
  timestamp: Date
  severity?: number
  statute?: string
  confidence?: number
  isRead?: boolean
  isSticky?: boolean // Critical alerts stay until manually dismissed
  expiresAt?: Date
}

interface AlertSystemProps {
  alerts: Alert[]
  onDismiss: (alertId: string) => void
  onDismissAll: () => void
  onMarkAsRead: (alertId: string) => void
  maxVisibleAlerts?: number
  autoHideDelay?: number
}

const AlertIcon: React.FC<{ type: Alert['type'] }> = ({ type }) => {
  const iconProps = { className: "w-5 h-5 flex-shrink-0" }
  
  switch (type) {
    case 'critical':
      return <Warning {...iconProps} className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
    case 'warning':
      return <Warning {...iconProps} className="w-5 h-5 text-yellow-400 flex-shrink-0" />
    case 'info':
      return <Info {...iconProps} className="w-5 h-5 text-blue-400 flex-shrink-0" />
    case 'success':
      return <Shield {...iconProps} className="w-5 h-5 text-green-400 flex-shrink-0" />
    default:
      return <WarningCircle {...iconProps} className="w-5 h-5 text-gray-400 flex-shrink-0" />
  }
}

const CategoryIcon: React.FC<{ category: Alert['category'] }> = ({ category }) => {
  const iconProps = { className: "w-3 h-3" }
  
  switch (category) {
    case 'violation':
      return <Warning {...iconProps} />
    case 'system':
      return <Activity {...iconProps} />
    case 'analysis':
      return <Activity {...iconProps} />
    case 'training':
      return <Activity {...iconProps} />
    case 'database':
      return <Database {...iconProps} />
    default:
      return <Info {...iconProps} />
  }
}

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  
  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  
  return timestamp.toLocaleDateString()
}

const AlertItem: React.FC<{
  alert: Alert
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
  index: number
}> = ({ alert, onDismiss, onMarkAsRead, index }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getAlertStyles = () => {
    switch (alert.type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/50 shadow-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/20'
      case 'success':
        return 'bg-green-500/10 border-green-500/50 shadow-green-500/20'
      case 'info':
        return 'bg-blue-500/10 border-blue-500/50 shadow-blue-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/50 shadow-gray-500/20'
    }
  }

  const getSeverityColor = () => {
    if (!alert.severity) return 'text-gray-400'
    if (alert.severity >= 9) return 'text-red-400'
    if (alert.severity >= 7) return 'text-orange-400'
    if (alert.severity >= 5) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      className={`relative p-4 rounded-lg backdrop-blur border shadow-lg ${getAlertStyles()}`}
    >
      {/* Severity Indicator */}
      {alert.severity && (
        <div className="absolute top-2 left-2">
          <div className={`w-2 h-2 rounded-full ${getSeverityColor().replace('text-', 'bg-')} animate-pulse`} />
        </div>
      )}

      <div className="flex items-start gap-3 pl-4">
        <AlertIcon type={alert.type} />
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-200 truncate">
                {alert.title}
              </h4>
              <Badge 
                variant="outline" 
                className="text-xs flex items-center gap-1"
              >
                <CategoryIcon category={alert.category} />
                {alert.category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-1">
              {!alert.isRead && (
                <button
                  onClick={() => onMarkAsRead(alert.id)}
                  className="w-2 h-2 bg-blue-500 rounded-full hover:bg-blue-400 transition-colors"
                  title="Mark as read"
                />
              )}
              <button
                onClick={() => onDismiss(alert.id)}
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-300 mb-2">
            {alert.message}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(alert.timestamp)}
              </span>
              
              {alert.statute && (
                <span className="text-purple-400">
                  {alert.statute}
                </span>
              )}
              
              {alert.confidence && (
                <span className={getSeverityColor()}>
                  {(alert.confidence * 100).toFixed(0)}% confidence
                </span>
              )}
            </div>

            {alert.details && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {isExpanded ? 'Less' : 'Details'}
              </button>
            )}
          </div>

          {/* Expandable Details */}
          <AnimatePresence>
            {isExpanded && alert.details && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-gray-700"
              >
                <p className="text-xs text-gray-400">
                  {alert.details}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Critical Alert Indicator */}
      {alert.type === 'critical' && (
        <div className="absolute inset-0 rounded-lg border-2 border-red-500/20 animate-pulse pointer-events-none" />
      )}
    </motion.div>
  )
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  alerts,
  onDismiss,
  onDismissAll,
  onMarkAsRead,
  maxVisibleAlerts = 5,
  autoHideDelay = 8000
}) => {
  const [visibleAlerts, setVisibleAlerts] = useState<Alert[]>([])

  // Auto-hide non-sticky alerts
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    
    alerts.forEach(alert => {
      if (!alert.isSticky && alert.type !== 'critical') {
        const timer = setTimeout(() => {
          onDismiss(alert.id)
        }, autoHideDelay)
        timers.push(timer)
      }
    })

    return () => {
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [alerts, autoHideDelay, onDismiss])

  // Update visible alerts
  useEffect(() => {
    const sortedAlerts = [...alerts]
      .sort((a, b) => {
        // Critical alerts first
        if (a.type === 'critical' && b.type !== 'critical') return -1
        if (b.type === 'critical' && a.type !== 'critical') return 1
        
        // Then by timestamp (newest first)
        return b.timestamp.getTime() - a.timestamp.getTime()
      })
      .slice(0, maxVisibleAlerts)
    
    setVisibleAlerts(sortedAlerts)
  }, [alerts, maxVisibleAlerts])

  const unreadCount = alerts.filter(alert => !alert.isRead).length
  const criticalCount = alerts.filter(alert => alert.type === 'critical').length

  if (visibleAlerts.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 right-4 w-96 z-50">
      {/* Alert Header */}
      {alerts.length > maxVisibleAlerts && (
        <Card className="mb-2 p-3 bg-gray-900/90 border-gray-700 backdrop-blur">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-gray-300">
                {alerts.length} total alerts
              </span>
              {unreadCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismissAll}
              className="text-xs text-gray-500 hover:text-gray-300"
            >
              Dismiss All
            </Button>
          </div>
        </Card>
      )}

      {/* Alert Stack */}
      <div className="space-y-2 max-h-[80vh] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {visibleAlerts.map((alert, index) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              onDismiss={onDismiss}
              onMarkAsRead={onMarkAsRead}
              index={index}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Critical Alert Summary */}
      {criticalCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur"
        >
          <div className="flex items-center gap-2 text-red-400">
            <Warning className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">
              {criticalCount} Critical Alert{criticalCount > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-red-300 mt-1">
            Immediate attention required for criminal violations
          </p>
        </motion.div>
      )}
    </div>
  )
}