import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Warning, ArrowClockwise } from '@phosphor-icons/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log to console service if available
    if (window.console && typeof window.console.log === 'function') {
      window.console.log(`Application Error: ${error.message}`)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Warning size={24} />
                Application Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground mb-4">
                  The NITS Universal Forensic Intelligence System encountered an unexpected error. 
                  This could be due to a temporary issue with the analysis engine or pattern processing.
                </p>
                
                {this.state.error && (
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <div className="font-medium text-destructive mb-1">Error Details:</div>
                    <div className="font-mono text-xs break-all">
                      {this.state.error.message}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button onClick={this.handleRetry} variant="outline">
                  <ArrowClockwise size={16} className="mr-2" />
                  Try Again
                </Button>
                <Button onClick={this.handleReload}>
                  Reload Application
                </Button>
              </div>

              {this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Technical Details (for developers)
                  </summary>
                  <div className="mt-2 bg-muted p-3 rounded text-xs font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.name}
                    </div>
                    <div className="mb-2">
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack Trace:</strong>
                        <pre className="whitespace-pre-wrap mt-1 text-xs">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo && (
                      <div className="mt-2">
                        <strong>Component Stack:</strong>
                        <pre className="whitespace-pre-wrap mt-1 text-xs">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <div className="mb-1">
                  <strong>Troubleshooting Tips:</strong>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Try refreshing the page to reset the application state</li>
                  <li>Clear your browser cache and cookies for this site</li>
                  <li>Check if all uploaded documents are in supported formats</li>
                  <li>Disable browser extensions that might interfere with the application</li>
                  <li>If the error persists, try using a different browser</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}