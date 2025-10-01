/**
 * NITS Universal Forensic Intelligence System
 * Frontend Initialization Script
 * 
 * This module provides centralized frontend initialization and configuration
 * for the NITS system, including system setup, configuration management,
 * and utility functions for frontend operations.
 */

import { toast } from 'sonner'

/**
 * NITS Frontend Configuration
 */
export interface NITSFrontendConfig {
  systemName: string
  version: string
  environment: 'development' | 'production' | 'staging'
  features: {
    aiEnhanced: boolean
    autonomousTraining: boolean
    legalFortification: boolean
  }
}

/**
 * Default NITS configuration
 */
export const DEFAULT_NITS_CONFIG: NITSFrontendConfig = {
  systemName: 'NITS Universal Forensic Intelligence System',
  version: '2.0',
  environment: import.meta.env.MODE as 'development' | 'production' | 'staging',
  features: {
    aiEnhanced: true,
    autonomousTraining: true,
    legalFortification: true,
  },
}

/**
 * Initialize NITS frontend system
 */
export const initializeNITSFrontend = (config: Partial<NITSFrontendConfig> = {}): NITSFrontendConfig => {
  const finalConfig: NITSFrontendConfig = {
    ...DEFAULT_NITS_CONFIG,
    ...config,
    features: {
      ...DEFAULT_NITS_CONFIG.features,
      ...(config.features || {}),
    },
  }

  console.log(`[NITS] Initializing ${finalConfig.systemName} v${finalConfig.version}`)
  console.log(`[NITS] Environment: ${finalConfig.environment}`)
  console.log(`[NITS] Features:`, finalConfig.features)

  return finalConfig
}

/**
 * NITS System Logger
 */
export class NITSLogger {
  private prefix: string

  constructor(component: string = 'NITS') {
    this.prefix = `[${component}]`
  }

  info(message: string, ...args: any[]) {
    console.log(`${this.prefix}`, message, ...args)
  }

  warn(message: string, ...args: any[]) {
    console.warn(`${this.prefix}`, message, ...args)
  }

  error(message: string, ...args: any[]) {
    console.error(`${this.prefix}`, message, ...args)
  }

  success(message: string, ...args: any[]) {
    console.log(`${this.prefix} ✓`, message, ...args)
  }
}

/**
 * NITS Frontend Utilities
 */
export const NITSFrontendUtils = {
  /**
   * Format timestamp for display
   */
  formatTimestamp: (date: Date = new Date()): string => {
    return date.toISOString().replace('T', ' ').substring(0, 19)
  },

  /**
   * Display system notification
   */
  notify: (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message)
        break
      case 'error':
        toast.error(message)
        break
      case 'info':
      default:
        toast(message)
        break
    }
  },

  /**
   * Validate file type for NITS system
   */
  validateFileType: (filename: string, allowedExtensions: string[]): boolean => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return extension ? allowedExtensions.includes(extension) : false
  },

  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  },

  /**
   * Generate unique identifier
   */
  generateId: (): string => {
    return `nits-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  /**
   * Safe JSON parse with fallback
   */
  safeJsonParse: <T = any>(json: string, fallback: T): T => {
    try {
      return JSON.parse(json)
    } catch (e) {
      console.error('[NITS] JSON parse error:', e)
      return fallback
    }
  },
}

/**
 * NITS System Health Check
 */
export const performSystemHealthCheck = (): {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: Record<string, boolean>
  timestamp: string
} => {
  const checks = {
    browserSupport: typeof window !== 'undefined',
    localStorageAvailable: (() => {
      try {
        const test = '__nits_storage_test__'
        localStorage.setItem(test, test)
        localStorage.removeItem(test)
        return true
      } catch (e) {
        return false
      }
    })(),
    consoleAvailable: typeof console !== 'undefined',
    fetchAvailable: typeof fetch !== 'undefined',
  }

  const healthyCount = Object.values(checks).filter(Boolean).length
  const totalChecks = Object.keys(checks).length

  let status: 'healthy' | 'degraded' | 'unhealthy'
  if (healthyCount === totalChecks) {
    status = 'healthy'
  } else if (healthyCount >= totalChecks / 2) {
    status = 'degraded'
  } else {
    status = 'unhealthy'
  }

  return {
    status,
    checks,
    timestamp: NITSFrontendUtils.formatTimestamp(),
  }
}

/**
 * Export system info for debugging
 */
export const getSystemInfo = () => {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    online: navigator.onLine,
    cookieEnabled: navigator.cookieEnabled,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Initialize and export default logger
 */
export const logger = new NITSLogger('NITS-Frontend')

/**
 * Export default configuration
 */
export default {
  config: DEFAULT_NITS_CONFIG,
  initialize: initializeNITSFrontend,
  logger,
  utils: NITSFrontendUtils,
  healthCheck: performSystemHealthCheck,
  getSystemInfo,
}
