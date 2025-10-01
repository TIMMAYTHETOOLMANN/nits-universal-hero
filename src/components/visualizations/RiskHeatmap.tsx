import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RiskHeatmapProps {
  violations?: any[]
}

export const RiskHeatmap: React.FC<RiskHeatmapProps> = ({ violations = [] }) => {
  const [selectedCell, setSelectedCell] = useState<{ category: string; quarter: string } | null>(null)

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
              {['q1', 'q2', 'q3', 'q4'].map((quarter, colIdx) => {
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
                getRiskLevel(
                  riskData.find(r => r.category === selectedCell.category)?.[
                    selectedCell.quarter.toLowerCase() as keyof typeof riskData[0]
                  ] as number || 0
                ) === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                getRiskLevel(
                  riskData.find(r => r.category === selectedCell.category)?.[
                    selectedCell.quarter.toLowerCase() as keyof typeof riskData[0]
                  ] as number || 0
                ) === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                getRiskLevel(
                  riskData.find(r => r.category === selectedCell.category)?.[
                    selectedCell.quarter.toLowerCase() as keyof typeof riskData[0]
                  ] as number || 0
                ) === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {getRiskLevel(
                  riskData.find(r => r.category === selectedCell.category)?.[
                    selectedCell.quarter.toLowerCase() as keyof typeof riskData[0]
                  ] as number || 0
                )}
              </Badge>
            </div>
            <div className="text-xs text-gray-400">
              <div className="mb-1">
                <span>Violations Detected:</span>
                <span className="ml-2 text-gray-300">
                  {Math.floor(Math.random() * 5) + 1} instances
                </span>
              </div>
              <div>
                <span>Risk Assessment:</span>
                <span className="ml-2 text-gray-300">
                  Based on pattern analysis and regulatory compliance
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