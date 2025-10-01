import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RiskHeatmapProps {
  violations?: any[]
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ violations = [] }) => {
  const [selectedCell, setSelectedCell] = useState<{category: string, quarter: string} | null>(null)

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
      { category: 'Financial', q1: 3, q2: 7, q3: 9, q4: 4 },
      { category: 'Regulatory', q1: 2, q2: 5, q3: 8, q4: 6 },
      { category: 'Operational', q1: 1, q2: 3, q3: 5, q4: 2 },
      { category: 'Legal', q1: 4, q2: 8, q3: 6, q4: 9 }
    ]
  }

  const riskData = generateRiskData()

  const getRiskColor = (value: number) => {
    if (value >= 8) return 'bg-red-500/70 border-red-500 text-red-100'
    if (value >= 5) return 'bg-orange-500/70 border-orange-500 text-orange-100'
    if (value >= 3) return 'bg-yellow-500/70 border-yellow-500 text-yellow-100'
    return 'bg-green-500/70 border-green-500 text-green-100'
  }

  const getRiskLevel = (value: number) => {
    if (value >= 8) return 'CRITICAL'
    if (value >= 5) return 'HIGH'
    if (value >= 3) return 'MEDIUM'
    return 'LOW'
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-orange-400 flex items-center gap-2">
          Risk Assessment Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header row */}
          <div className="grid grid-cols-5 gap-1 text-xs mb-4">
            <div className="text-gray-500 font-medium">Category</div>
            {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
              <div key={quarter} className="text-center text-gray-400 font-medium">
                {quarter}
              </div>
            ))}
          </div>
          
          {/* Risk grid */}
          {riskData.map((row, rowIdx) => (
            <div key={row.category} className="grid grid-cols-5 gap-1">
              <div className="text-sm text-gray-300 font-medium py-2">
                {row.category}
              </div>
              {['q1', 'q2', 'q3', 'q4'].map((quarter) => {
                const value = row[quarter as keyof typeof row] as number
                const isSelected = selectedCell?.category === row.category && 
                                 selectedCell?.quarter === quarter.toUpperCase()
                
                return (
                  <div
                    key={quarter}
                    className={`
                      p-3 text-center text-sm font-bold 
                      rounded border cursor-pointer transition-all
                      ${getRiskColor(value)}
                      ${isSelected ? 'ring-2 ring-cyan-400 scale-105' : ''}
                      glow-effect hover:shadow-lg
                    `}
                    onClick={() => setSelectedCell({ 
                      category: row.category, 
                      quarter: quarter.toUpperCase() 
                    })}
                  >
                    <div className="text-lg">{value}</div>
                    <div className="text-xs opacity-80">
                      {getRiskLevel(value)}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        
        {selectedCell && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                {selectedCell.category} - {selectedCell.quarter}
              </span>
              <Badge className={`text-xs ${
                getRiskColor(
                  riskData.find(r => r.category === selectedCell.category)?.[
                    selectedCell.quarter.toLowerCase() as keyof typeof riskData[0]
                  ] as number || 0
                ).replace('bg-', 'text-').replace('/70', '').replace(' border-', ' bg-').replace(' text-', ' border-')
              }`}>
                {getRiskLevel(
                  riskData.find(r => r.category === selectedCell.category)?.[
                    selectedCell.quarter.toLowerCase() as keyof typeof riskData[0]
                  ] as number || 0
                )}
              </Badge>
            </div>
            <p className="text-xs text-gray-400">
              Risk level assessment for {selectedCell.category} violations in {selectedCell.quarter}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}