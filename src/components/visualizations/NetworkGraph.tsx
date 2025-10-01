import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface EntityNode {
  id: string
  x: number
  y: number
  label: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  type: 'target' | 'subsidiary' | 'shell' | 'offshore' | 'partner'
  connections: string[]
}

interface NetworkGraphProps {
  violations?: any[]
  entityData?: EntityNode[]
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ violations = [], entityData }) => {
  const [selectedNode, setSelectedNode] = useState<EntityNode | null>(null)
  const [animatedConnections, setAnimatedConnections] = useState<Set<string>>(new Set())

  // Default entity network data
  const defaultEntities: EntityNode[] = [
    {
      id: 'target',
      x: 50,
      y: 50,
      label: 'Target Entity',
      risk: 'high',
      type: 'target',
      connections: ['shell-a', 'subsidiary-b', 'offshore-c', 'partner-d']
    },
    {
      id: 'shell-a',
      x: 20,
      y: 30,
      label: 'Shell Co. A',
      risk: 'high',
      type: 'shell',
      connections: ['target', 'offshore-c']
    },
    {
      id: 'subsidiary-b',
      x: 80,
      y: 25,
      label: 'Subsidiary B',
      risk: 'medium',
      type: 'subsidiary',
      connections: ['target', 'partner-d']
    },
    {
      id: 'offshore-c',
      x: 25,
      y: 70,
      label: 'Offshore C',
      risk: 'critical',
      type: 'offshore',
      connections: ['target', 'shell-a']
    },
    {
      id: 'partner-d',
      x: 75,
      y: 75,
      label: 'Partner D',
      risk: 'low',
      type: 'partner',
      connections: ['target', 'subsidiary-b']
    }
  ]

  const entities = entityData || defaultEntities
  const targetEntity = entities.find(e => e.type === 'target') || entities[0]

  // Animate connections based on risk levels
  useEffect(() => {
    const interval = setInterval(() => {
      const highRiskConnections = entities
        .filter(e => e.risk === 'critical' || e.risk === 'high')
        .map(e => e.id)
      
      setAnimatedConnections(new Set(highRiskConnections))
      
      setTimeout(() => setAnimatedConnections(new Set()), 1000)
    }, 3000)

    return () => clearInterval(interval)
  }, [entities])

  const getNodeColor = (risk: string, isSelected: boolean) => {
    const colors = {
      critical: isSelected ? 'fill-red-400/40 stroke-red-400' : 'fill-red-500/20 stroke-red-500',
      high: isSelected ? 'fill-orange-400/40 stroke-orange-400' : 'fill-orange-500/20 stroke-orange-500',
      medium: isSelected ? 'fill-yellow-400/40 stroke-yellow-400' : 'fill-yellow-500/20 stroke-yellow-500',
      low: isSelected ? 'fill-green-400/40 stroke-green-400' : 'fill-green-500/20 stroke-green-500'
    }
    return colors[risk as keyof typeof colors] || colors.low
  }

  const getConnectionColor = (fromNode: EntityNode, toNode: EntityNode) => {
    const maxRisk = Math.max(
      ['low', 'medium', 'high', 'critical'].indexOf(fromNode.risk),
      ['low', 'medium', 'high', 'critical'].indexOf(toNode.risk)
    )
    
    const colors = ['stroke-green-500', 'stroke-yellow-500', 'stroke-orange-500', 'stroke-red-500']
    return colors[maxRisk] || 'stroke-gray-600'
  }

  const isConnectionAnimated = (nodeId: string) => animatedConnections.has(nodeId)

  const getNodeRadius = (entity: EntityNode) => {
    if (entity.type === 'target') return 35
    if (entity.risk === 'critical') return 25
    if (entity.risk === 'high') return 22
    return 20
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-purple-400 flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded-full opacity-50" />
          Entity Relationship Network
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-80 mb-4">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            {/* Render connections first (behind nodes) */}
            {entities.map(entity => 
              entity.connections.map(connectionId => {
                const connectedEntity = entities.find(e => e.id === connectionId)
                if (!connectedEntity) return null
                
                const isAnimated = isConnectionAnimated(entity.id) || isConnectionAnimated(connectionId)
                
                return (
                  <line
                    key={`${entity.id}-${connectionId}`}
                    x1={entity.x}
                    y1={entity.y}
                    x2={connectedEntity.x}
                    y2={connectedEntity.y}
                    className={`${getConnectionColor(entity, connectedEntity)} transition-all duration-300`}
                    strokeWidth={isAnimated ? "0.5" : "0.3"}
                    strokeDasharray={entity.risk === 'critical' || connectedEntity.risk === 'critical' ? "2,1" : "none"}
                    opacity={isAnimated ? 0.9 : 0.6}
                  />
                )
              })
            )}
            
            {/* Render nodes */}
            {entities.map(entity => {
              const isSelected = selectedNode?.id === entity.id
              const isAnimated = isConnectionAnimated(entity.id)
              
              return (
                <g key={entity.id}>
                  {/* Pulse effect for high-risk nodes */}
                  {(entity.risk === 'critical' || entity.risk === 'high') && (
                    <circle
                      cx={entity.x}
                      cy={entity.y}
                      r={getNodeRadius(entity)}
                      className={`${getNodeColor(entity.risk, false)} opacity-20`}
                    >
                      <animate 
                        attributeName="r" 
                        values={`${getNodeRadius(entity)};${getNodeRadius(entity) + 8};${getNodeRadius(entity)}`}
                        dur="2s" 
                        repeatCount="indefinite" 
                      />
                    </circle>
                  )}
                  
                  {/* Main node circle */}
                  <circle
                    cx={entity.x}
                    cy={entity.y}
                    r={getNodeRadius(entity)}
                    className={`${getNodeColor(entity.risk, isSelected)} cursor-pointer transition-all duration-300 hover:opacity-80`}
                    strokeWidth={isSelected ? "2" : isAnimated ? "1.5" : "1"}
                    onClick={() => setSelectedNode(isSelected ? null : entity)}
                  />
                  
                  {/* Node label */}
                  <text
                    x={entity.x}
                    y={entity.y}
                    className="fill-gray-300 text-[3px] pointer-events-none"
                    textAnchor="middle"
                    dy=".3em"
                    fontWeight={entity.type === 'target' ? 'bold' : 'normal'}
                  >
                    {entity.label}
                  </text>
                  
                  {/* Risk indicator for non-target entities */}
                  {entity.type !== 'target' && (
                    <circle
                      cx={entity.x + getNodeRadius(entity) * 0.6}
                      cy={entity.y - getNodeRadius(entity) * 0.6}
                      r="3"
                      className={`${getNodeColor(entity.risk, false)} opacity-80`}
                    />
                  )}
                </g>
              )
            })}
          </svg>
        </div>
        
        {/* Node details panel */}
        {selectedNode && (
          <div className="p-3 bg-gray-800/70 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                {selectedNode.label}
              </span>
              <div className="flex items-center gap-2">
                <Badge className="text-xs bg-gray-700 text-gray-300">
                  {selectedNode.type.toUpperCase()}
                </Badge>
                <Badge className={`text-xs ${
                  selectedNode.risk === 'critical' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                  selectedNode.risk === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                  selectedNode.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                  'bg-green-500/20 text-green-400 border-green-500/50'
                }`}>
                  {selectedNode.risk.toUpperCase()} RISK
                </Badge>
              </div>
            </div>
            
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Entity ID:</span>
                <span className="font-mono text-cyan-400">{selectedNode.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Connections:</span>
                <span className="font-mono text-purple-400">{selectedNode.connections.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Network Position:</span>
                <span className="font-mono text-green-400">
                  ({selectedNode.x.toFixed(0)}, {selectedNode.y.toFixed(0)})
                </span>
              </div>
            </div>
            
            {/* Connected entities */}
            <div className="mt-3 pt-2 border-t border-gray-700">
              <span className="text-xs text-gray-500 block mb-1">Connected Entities:</span>
              <div className="flex flex-wrap gap-1">
                {selectedNode.connections.map(connId => {
                  const connectedEntity = entities.find(e => e.id === connId)
                  if (!connectedEntity) return null
                  
                  return (
                    <button
                      key={connId}
                      onClick={() => setSelectedNode(connectedEntity)}
                      className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-700 rounded border border-gray-600 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {connectedEntity.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-800">
          <span>Risk Levels:</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500/50 rounded-full border border-green-500" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500/50 rounded-full border border-yellow-500" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500/50 rounded-full border border-orange-500" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500/50 rounded-full border border-red-500" />
              <span>Critical</span>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-2 text-center">
          Click nodes to inspect • Animated connections indicate high-risk relationships
        </div>
      </CardContent>
    </Card>
  )
}