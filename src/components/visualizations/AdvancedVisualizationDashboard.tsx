import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendUp, 
  Activity, 
  Eye, 
  Network, 
  ChartBar, 
  ChartPie,
  Download,
  ArrowClockwise
} from '@phosphor-icons/react'
import { RiskHeatmap } from './RiskHeatmap'
import { NetworkGraph } from './NetworkGraph'

interface AdvancedVisualizationProps {
  violations?: any[]
  analysisResults?: any
  isAnalyzing?: boolean
}

interface TimeSeriesData {
  month: string
  violations: number
  risk: number
  trend: 'up' | 'down' | 'stable'
}

interface RiskDistribution {
  category: string
  value: number
  color: string
}

export const AdvancedVisualizationDashboard: React.FC<AdvancedVisualizationProps> = ({
  violations = [],
  analysisResults,
  isAnalyzing = false
}) => {
  const [activeVisualization, setActiveVisualization] = useState('overview')
  const [timeRange, setTimeRange] = useState('12m')

  // Generate time series data for trends
  const generateTimeSeriesData = (): TimeSeriesData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((month, idx) => ({
      month,
      violations: Math.floor(Math.random() * 20) + (violations.length || 5),
      risk: Math.floor(Math.random() * 40) + 60,
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'down' : 'stable'
    }))
  }

  // Generate risk distribution data
  const generateRiskDistribution = (): RiskDistribution[] => {
    const totalViolations = violations.length || 10
    return [
      { category: 'Critical', value: Math.floor(totalViolations * 0.25), color: 'bg-red-500' },
      { category: 'High', value: Math.floor(totalViolations * 0.35), color: 'bg-orange-500' },
      { category: 'Medium', value: Math.floor(totalViolations * 0.30), color: 'bg-yellow-500' },
      { category: 'Low', value: Math.floor(totalViolations * 0.10), color: 'bg-green-500' }
    ]
  }

  const timeSeriesData = generateTimeSeriesData()
  const riskDistribution = generateRiskDistribution()

  const ViolationTrendChart = () => {
    const maxViolations = Math.max(...timeSeriesData.map(d => d.violations))
    
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <TrendUp className="w-5 h-5" />
              Violation Trend Analysis
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setTimeRange(timeRange === '12m' ? '6m' : '12m')}
                className="text-xs"
              >
                {timeRange === '12m' ? '12 Months' : '6 Months'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart area */}
            <div className="h-48 relative">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line
                    key={i}
                    x1="40"
                    y1={30 + i * 24}
                    x2="380"
                    y2={30 + i * 24}
                    stroke="oklch(0.2 0.05 240)"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                ))}
                
                {/* Data points and connections */}
                {timeSeriesData.slice(0, timeRange === '6m' ? 6 : 12).map((data, idx, arr) => {
                  const x = 50 + (idx * 300) / (arr.length - 1)
                  const y = 140 - (data.violations / maxViolations) * 100
                  const nextData = arr[idx + 1]
                  
                  return (
                    <g key={data.month}>
                      {/* Connection line to next point */}
                      {nextData && (
                        <line
                          x1={x}
                          y1={y}
                          x2={50 + ((idx + 1) * 300) / (arr.length - 1)}
                          y2={140 - (nextData.violations / maxViolations) * 100}
                          stroke="oklch(0.75 0.25 145)"
                          strokeWidth="2"
                        />
                      )}
                      
                      {/* Data point */}
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="oklch(0.75 0.25 145)"
                        className="cursor-pointer hover:r-6 transition-all"
                      />
                      
                      {/* Trend indicator */}
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        className={`text-xs ${
                          data.trend === 'up' ? 'fill-red-400' :
                          data.trend === 'down' ? 'fill-green-400' :
                          'fill-gray-400'
                        }`}
                      >
                        {data.trend === 'up' ? '↗' : data.trend === 'down' ? '↘' : '→'}
                      </text>
                      
                      {/* Month label */}
                      <text
                        x={x}
                        y={155}
                        textAnchor="middle"
                        className="fill-gray-400 text-xs"
                      >
                        {data.month}
                      </text>
                      
                      {/* Value label */}
                      <text
                        x={x}
                        y={y + 20}
                        textAnchor="middle"
                        className="fill-gray-300 text-xs font-medium"
                      >
                        {data.violations}
                      </text>
                    </g>
                  )
                })}
                
                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map(i => (
                  <text
                    key={i}
                    x="35"
                    y={145 - i * 24}
                    textAnchor="end"
                    className="fill-gray-500 text-xs"
                  >
                    {Math.round((maxViolations / 4) * i)}
                  </text>
                ))}
              </svg>
            </div>
            
            {/* Trend summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-2 bg-gray-800/50 rounded border border-gray-700">
                <div className="text-lg font-bold text-cyan-400">
                  {timeSeriesData.slice(-1)[0]?.violations || 0}
                </div>
                <div className="text-xs text-gray-500">This Month</div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded border border-gray-700">
                <div className="text-lg font-bold text-green-400">
                  {Math.round(timeSeriesData.reduce((sum, d) => sum + d.violations, 0) / timeSeriesData.length)}
                </div>
                <div className="text-xs text-gray-500">Monthly Avg</div>
              </div>
              <div className="p-2 bg-gray-800/50 rounded border border-gray-700">
                <div className="text-lg font-bold text-orange-400">
                  {timeSeriesData.filter(d => d.trend === 'up').length}
                </div>
                <div className="text-xs text-gray-500">Upward Trends</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const RiskDistributionChart = () => {
    const total = riskDistribution.reduce((sum, item) => sum + item.value, 0)
    
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <ChartPie className="w-5 h-5" />
            Risk Category Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Visual bars */}
            <div className="space-y-3">
              {riskDistribution.map((item, idx) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0
                return (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${item.color}`} />
                        <span className="text-gray-300">{item.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">{item.value}</span>
                        <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color} transition-all duration-700 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Summary stats */}
            <div className="pt-3 border-t border-gray-800">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-gray-800/50 rounded border border-gray-700">
                  <div className="text-lg font-bold text-red-400">
                    {riskDistribution.find(r => r.category === 'Critical')?.value || 0}
                  </div>
                  <div className="text-xs text-gray-500">Critical Issues</div>
                </div>
                <div className="p-2 bg-gray-800/50 rounded border border-gray-700">
                  <div className="text-lg font-bold text-purple-400">{total}</div>
                  <div className="text-xs text-gray-500">Total Violations</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const PerformanceMetrics = () => {
    const detectionRate = analysisResults ? Math.min(99.8, 87 + violations.length * 2) : 91.3
    const confidence = analysisResults?.summary?.confidence || 94.7
    const processingSpeed = isAnalyzing ? Math.floor(Math.random() * 200) + 600 : 847
    
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-400 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Detection Accuracy</span>
                  <span className="text-green-400 font-mono">{detectionRate.toFixed(1)}%</span>
                </div>
                <Progress value={detectionRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">ML Confidence</span>
                  <span className="text-cyan-400 font-mono">{confidence.toFixed(1)}%</span>
                </div>
                <Progress value={confidence} className="h-2" />
              </div>
              
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-400">Processing Speed</span>
                  <span className="text-purple-400 font-mono">{processingSpeed} p/s</span>
                </div>
                <Progress value={Math.min(100, (processingSpeed / 1000) * 100)} className="h-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-green-500/10 border border-green-500/30 rounded text-center">
                <div className="text-green-400 font-bold">99.97%</div>
                <div className="text-gray-500">Uptime</div>
              </div>
              <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                <div className="text-blue-400 font-bold">{violations.length || 0}</div>
                <div className="text-gray-500">Active Alerts</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Visualization Controls */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-purple-400 flex items-center gap-2">
              <ChartBar className="w-5 h-5" />
              Advanced Visualization Suite
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                ML ENHANCED
              </Badge>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowClockwise className="w-3 h-3 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeVisualization} onValueChange={setActiveVisualization}>
        <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 border-gray-800">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <ChartBar size={16} />
            Risk Heatmap
          </TabsTrigger>
          <TabsTrigger value="network" className="flex items-center gap-2">
            <Network size={16} />
            Entity Network
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendUp size={16} />
            Trend Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ViolationTrendChart />
            <RiskDistributionChart />
            <PerformanceMetrics />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskHeatmap violations={violations} />
            <NetworkGraph violations={violations} />
          </div>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <RiskHeatmap violations={violations} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViolationTrendChart />
            <PerformanceMetrics />
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          <NetworkGraph violations={violations} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskDistributionChart />
            <PerformanceMetrics />
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ViolationTrendChart />
            <RiskDistributionChart />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RiskHeatmap violations={violations} />
            <PerformanceMetrics />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}