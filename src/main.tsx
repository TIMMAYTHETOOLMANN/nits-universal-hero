import { createRoot } from 'react-dom/client'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { initializeNITSFrontend, performSystemHealthCheck, logger } from './nits-frontend-script'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

// Initialize NITS frontend system
const config = initializeNITSFrontend()
logger.info(`System initialized: ${config.systemName} v${config.version}`)

// Perform system health check
const healthCheck = performSystemHealthCheck()
logger.info(`System health: ${healthCheck.status}`, healthCheck.checks)

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
   </ErrorBoundary>
)
