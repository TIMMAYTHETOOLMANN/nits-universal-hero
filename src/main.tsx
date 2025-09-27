import { createRoot } from 'react-dom/client'
import "@github/spark/spark"

import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
   </ErrorBoundary>
)
