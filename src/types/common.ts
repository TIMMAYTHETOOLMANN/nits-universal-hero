export interface FileItem {
  name: string
  size: number
  type: string
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ActorType = 'natural_person' | 'other_person'
export type FalsePositiveRisk = 'low' | 'medium' | 'high'

// Window interface declaration moved to hooks/useAutonomousTraining.ts as global declaration