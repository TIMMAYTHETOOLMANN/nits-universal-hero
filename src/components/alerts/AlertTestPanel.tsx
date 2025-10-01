import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useAlertManager } from '../../hooks/useAlertManager'

export const AlertTestPanel: React.FC = () => {
  const alertManager = useAlertManager()

  // Add some sample alerts for demonstration
  useEffect(() => {
    // Simulate real alerts after a delay
    const timer = setTimeout(() => {
      alertManager.addCriticalAlert(
        'Criminal Violation Detected',
        'High-confidence insider trading pattern identified',
        {
          statute: '15 U.S.C. § 78u-1',
          confidence: 0.94,
          details: 'Document analysis revealed coordinated trading patterns preceding earnings announcement'
        }
      )

      alertManager.addWarningAlert(
        'Unusual Financial Pattern',
        'Q3 revenue recognition shows irregular timing',
        {
          confidence: 0.76,
          details: 'Revenue concentration in final week of quarter exceeds historical patterns'
        }
      )

      alertManager.addInfoAlert(
        'Database Update Complete',
        'Legal database synchronized with 1,247 new regulations'
      )
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const triggerCriticalAlert = () => {
    alertManager.addCriticalAlert(
      'Test Criminal Violation',
      'This is a test critical alert for demonstration purposes',
      {
        statute: '15 U.S.C. § 78j(b)',
        confidence: 0.89,
        details: 'Test evidence for demonstration purposes only'
      }
    )
  }

  const triggerWarningAlert = () => {
    alertManager.addWarningAlert(
      'Test Warning Alert',
      'This is a test warning alert for demonstration purposes',
      {
        confidence: 0.65,
        details: 'Test warning details for demonstration'
      }
    )
  }

  const triggerInfoAlert = () => {
    alertManager.addInfoAlert(
      'Test Information Alert',
      'This is a test information alert for demonstration purposes'
    )
  }

  const triggerSuccessAlert = () => {
    alertManager.addSuccessAlert(
      'Test Success Alert',
      'This is a test success alert for demonstration purposes'
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-cyan-400 text-sm">Alert System Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={triggerCriticalAlert}
            variant="outline"
            size="sm"
            className="text-red-400 border-red-500/50 hover:bg-red-500/10"
          >
            Critical Alert
          </Button>
          <Button 
            onClick={triggerWarningAlert}
            variant="outline"
            size="sm"
            className="text-yellow-400 border-yellow-500/50 hover:bg-yellow-500/10"
          >
            Warning Alert
          </Button>
          <Button 
            onClick={triggerInfoAlert}
            variant="outline"
            size="sm"
            className="text-blue-400 border-blue-500/50 hover:bg-blue-500/10"
          >
            Info Alert
          </Button>
          <Button 
            onClick={triggerSuccessAlert}
            variant="outline"
            size="sm"
            className="text-green-400 border-green-500/50 hover:bg-green-500/10"
          >
            Success Alert
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
          <div className="flex justify-between">
            <span>Active Alerts: {alertManager.alerts.length}</span>
            <span>Unread: {alertManager.unreadCount}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Critical: {alertManager.criticalCount}</span>
            <Button 
              onClick={alertManager.dismissAll}
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-1"
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}