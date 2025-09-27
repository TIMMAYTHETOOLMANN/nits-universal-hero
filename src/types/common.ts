export interface FileItem {
  name: string
  size: number
  type: string
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ActorType = 'natural_person' | 'other_person'
export type FalsePositiveRisk = 'low' | 'medium' | 'high'

export interface Window {
  spark: {
    llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string
    llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>
  }
}