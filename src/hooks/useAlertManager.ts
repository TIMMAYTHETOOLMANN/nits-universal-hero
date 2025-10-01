import { useState, useCallback, useRef } from 'react'
import { Alert } from '../components/alerts/AlertSystem'
import { AnalysisResult } from '../types/analysis'

export interface AlertManagerState {
  alerts: Alert[]
  unreadCount: number
  criticalCount: number
}

export const useAlertManager = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const alertCounter = useRef(0)

  const generateAlertId = () => `alert_${Date.now()}_${++alertCounter.current}`

  const createAlert = useCallback((
    type: Alert['type'],
    category: Alert['category'],
    title: string,
    message: string,
    options?: Partial<Omit<Alert, 'id' | 'type' | 'category' | 'title' | 'message' | 'timestamp'>>
  ): Alert => {
    return {
      id: generateAlertId(),
      type,
      category,
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      isSticky: type === 'critical',
      ...options
    }
  }, [])

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'timestamp'>) => {
    const newAlert: Alert = {
      ...alert,
      id: generateAlertId(),
      timestamp: new Date()
    }

    setAlerts(prev => [newAlert, ...prev])
    return newAlert.id
  }, [])

  const addCriticalAlert = useCallback((
    title: string,
    message: string,
    options?: {
      statute?: string
      confidence?: number
      details?: string
      category?: Alert['category']
    }
  ) => {
    return addAlert({
      type: 'critical',
      category: options?.category || 'violation',
      title,
      message,
      isSticky: true,
      statute: options?.statute,
      confidence: options?.confidence,
      details: options?.details,
      severity: 10
    })
  }, [addAlert])

  const addWarningAlert = useCallback((
    title: string,
    message: string,
    options?: {
      category?: Alert['category']
      details?: string
      confidence?: number
    }
  ) => {
    return addAlert({
      type: 'warning',
      category: options?.category || 'analysis',
      title,
      message,
      details: options?.details,
      confidence: options?.confidence,
      severity: 6
    })
  }, [addAlert])

  const addInfoAlert = useCallback((
    title: string,
    message: string,
    options?: {
      category?: Alert['category']
      details?: string
    }
  ) => {
    return addAlert({
      type: 'info',
      category: options?.category || 'system',
      title,
      message,
      details: options?.details,
      severity: 3
    })
  }, [addAlert])

  const addSuccessAlert = useCallback((
    title: string,
    message: string,
    options?: {
      category?: Alert['category']
      details?: string
    }
  ) => {
    return addAlert({
      type: 'success',
      category: options?.category || 'system',
      title,
      message,
      details: options?.details,
      severity: 1
    })
  }, [addAlert])

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId))
  }, [])

  const dismissAll = useCallback(() => {
    setAlerts([])
  }, [])

  const markAsRead = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ))
  }, [])

  const markAllAsRead = useCallback(() => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))
  }, [])

  // Generate alerts from analysis results
  const processAnalysisResults = useCallback((results: AnalysisResult) => {
    // Clear previous analysis alerts
    setAlerts(prev => prev.filter(alert => alert.category !== 'violation' && alert.category !== 'analysis'))

    // Add alerts for violations
    if (results.violations && results.violations.length > 0) {
      results.violations.forEach((violation, index) => {
        const severity = violation.false_positive_risk === 'low' ? 'critical' :
                        violation.false_positive_risk === 'medium' ? 'warning' : 'info'
        
        if (severity === 'critical') {
          addCriticalAlert(
            `Criminal Violation: ${violation.violation_flag}`,
            `High-confidence criminal violation detected with ${(violation.confidence_score * 100).toFixed(0)}% certainty`,
            {
              statute: violation.statutory_basis || 'Multiple statutes',
              confidence: violation.confidence_score,
              details: violation.evidence[0]?.exact_quote || 'Evidence found in document analysis',
              category: 'violation'
            }
          )
        } else if (severity === 'warning') {
          addWarningAlert(
            `Civil Violation: ${violation.violation_flag}`,
            `Potential civil violation requires review`,
            {
              confidence: violation.confidence_score,
              details: violation.evidence[0]?.exact_quote || 'Evidence requires manual review',
              category: 'violation'
            }
          )
        }
      })

      // Summary alert
      const criticalCount = results.violations.filter(v => v.false_positive_risk === 'low').length
      const civilCount = results.violations.filter(v => v.false_positive_risk === 'medium').length
      
      if (criticalCount > 0) {
        addCriticalAlert(
          'Analysis Complete - Criminal Activity Detected',
          `Found ${criticalCount} criminal violation${criticalCount > 1 ? 's' : ''} requiring immediate action`,
          {
            category: 'analysis',
            details: `Total violations: ${results.violations.length} (${criticalCount} criminal, ${civilCount} civil)`
          }
        )
      } else {
        addInfoAlert(
          'Analysis Complete',
          `Found ${results.violations.length} potential violation${results.violations.length > 1 ? 's' : ''} requiring review`,
          {
            category: 'analysis',
            details: `${civilCount} civil violations detected`
          }
        )
      }
    } else {
      addSuccessAlert(
        'Analysis Complete - No Violations',
        'Document analysis completed with no regulatory violations detected',
        {
          category: 'analysis',
          details: 'All documents passed compliance screening'
        }
      )
    }
  }, [addCriticalAlert, addWarningAlert, addInfoAlert, addSuccessAlert])

  // System status alerts
  const addSystemAlert = useCallback((
    message: string,
    type: 'info' | 'warning' | 'success' = 'info'
  ) => {
    const alertMap = {
      info: addInfoAlert,
      warning: addWarningAlert,
      success: addSuccessAlert
    }

    return alertMap[type](
      'System Status',
      message,
      { category: 'system' }
    )
  }, [addInfoAlert, addWarningAlert, addSuccessAlert])

  // Training alerts
  const addTrainingAlert = useCallback((
    message: string,
    type: 'info' | 'success' = 'info',
    details?: string
  ) => {
    const alertMap = {
      info: addInfoAlert,
      success: addSuccessAlert
    }

    return alertMap[type](
      'Autonomous Training',
      message,
      { category: 'training', details }
    )
  }, [addInfoAlert, addSuccessAlert])

  // Database alerts
  const addDatabaseAlert = useCallback((
    message: string,
    type: 'info' | 'success' = 'info',
    details?: string
  ) => {
    const alertMap = {
      info: addInfoAlert,
      success: addSuccessAlert
    }

    return alertMap[type](
      'Legal Database',
      message,
      { category: 'database', details }
    )
  }, [addInfoAlert, addSuccessAlert])

  // Computed values
  const unreadCount = alerts.filter(alert => !alert.isRead).length
  const criticalCount = alerts.filter(alert => alert.type === 'critical').length

  return {
    alerts,
    unreadCount,
    criticalCount,
    addAlert,
    addCriticalAlert,
    addWarningAlert,
    addInfoAlert,
    addSuccessAlert,
    addSystemAlert,
    addTrainingAlert,
    addDatabaseAlert,
    dismissAlert,
    dismissAll,
    markAsRead,
    markAllAsRead,
    processAnalysisResults
  }
}