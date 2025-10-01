import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RiskCell {
  category: string
  quarter: string
  value: number
}

interface RiskHeatmapProps {
  violations?: any[]
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ violations = [] }) => {
  const [selectedCell, setSelectedCell] = useState<RiskCell | null>(null)
  
  // Generate risk data based on violations or use mock data
  const generateRiskData = () => {
    if (violations.length > 0) {
      const categories = ['Financial', 'Regulatory', 'Operational', 'Legal']
      return categories.map(category => ({
        category,
        q1: Math.floor(Math.random() * 10) + 1,
        q2: Math.floor(Math.random() * 10) + 1,
        q3: Math.floor(Math.random() * 10) + 1,
        q4: Math.floor(Math.random() * 10) + 1,
      }))
    }
    
    // Default mock data
    return [
      { category: 'Financial', q1: 3, q2: 7, q3: 9, q4: 5 },
      { category: 'Regulatory', q1: 2, q2: 4, q3: 6, q4: 8 },
      { category: 'Operational', q1: 1, q2: 3, q3: 4, q4: 3 },
      { category: 'Legal', q1: 5, q2: 8, q3: 10, q4: 7 }
    ]
  }
  
  const riskData = generateRiskData()
  
  const getColor = (value: number) => {
    if (value >= 8) return 'bg-red-500/50 border-red-500/70'
    if (value >= 5) return 'bg-orange-500/50 border-orange-500/70'
    if (value >= 3) return 'bg-yellow-500/50 border-yellow-500/70'
    return 'bg-green-500/50 border-green-500/70'
  }
  
  const getRiskLevel = (value: number) => {
    if (value >= 8) return 'Critical'
    if (value >= 5) return 'High'
    if (value >= 3) return 'Medium'
    return 'Low'
  }
  
  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-400 flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded opacity-50" />
          Risk Assessment Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-1 text-xs mb-4">
          <div />
          {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
            <div key={quarter} className="text-center text-gray-500 py-2 font-medium">
              {quarter}
            </div>
          ))}
          
          {riskData.map(row => (
            <React.Fragment key={row.category}>
              <div className="text-gray-400 pr-2 py-3 font-medium text-right">
                {row.category}
              </div>
              {['q1', 'q2', 'q3', 'q4'].map(quarter => (
                <div
                  key={quarter}
                  className={`
                    ${getColor(row[quarter as keyof typeof row] as number)} 
                    rounded border cursor-pointer hover:opacity-80 hover:scale-105 
                    transition-all duration-200 flex items-center justify-center py-3 
                    glow-effect hover:shadow-lg
                  `}
                  onClick={() => setSelectedCell({ 
                    category: row.category, 
                    quarter: quarter.toUpperCase(), 
                    value: row[quarter as keyof typeof row] as number 
                  })}
                >
                  <span className="font-bold text-gray-200">
                    {row[quarter as keyof typeof row]}
                  </span>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        
        {selectedCell && (
          <div className="p-3 bg-gray-800/70 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                {selectedCell.category} Risk - {selectedCell.quarter}
              </span>
              <Badge className={`
                ${selectedCell.value >= 8 ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                  selectedCell.value >= 5 ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                  selectedCell.value >= 3 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                  'bg-green-500/20 text-green-400 border-green-500/50'}
              `}>
                {getRiskLevel(selectedCell.value)}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">
              <div className="flex items-center justify-between">
                <span>Violations Detected:</span>
                <span className="font-mono text-cyan-400">{selectedCell.value}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Risk Score:</span>
                <span className="font-mono text-purple-400">
                  {(selectedCell.value * 10).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-800">
          <span>Risk Threshold Legend:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/50 rounded border border-green-500/70" />
              <span>Low (1-2)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500/50 rounded border border-yellow-500/70" />
              <span>Med (3-4)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500/50 rounded border border-orange-500/70" />
              <span>High (5-7)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500/50 rounded border border-red-500/70" />
              <span>Critical (8+)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}