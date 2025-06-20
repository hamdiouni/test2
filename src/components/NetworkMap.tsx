import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, Marker } from 'react-leaflet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Activity, AlertTriangle, CheckCircle, Server, Wifi, Router, Cpu, HardDrive, Layers, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NetworkMapProps {
  telemetryData: any[];
  predictions: any[];
}

const NetworkMap: React.FC<NetworkMapProps> = ({ telemetryData, predictions }) => {
  // Enhanced network nodes with more realistic global locations
  const nodes = {
    'NYC-DC-01': { 
      lat: 40.7128, 
      lng: -74.0060, 
      name: 'New York Data Center',
      type: 'datacenter',
      region: 'us-east-1',
      capacity: '40Gbps',
      status: 'operational',
      city: 'New York'
    },
    'LAX-DC-02': { 
      lat: 34.0522, 
      lng: -118.2437, 
      name: 'Los Angeles Hub',
      type: 'core',
      region: 'us-west-1',
      capacity: '50Gbps',
      status: 'operational',
      city: 'Los Angeles'
    },
    'CHI-DC-03': { 
      lat: 41.8781, 
      lng: -87.6298, 
      name: 'Chicago Core',
      type: 'core',
      region: 'us-central-1',
      capacity: '35Gbps',
      status: 'operational',
      city: 'Chicago'
    },
    'MIA-DC-04': { 
      lat: 25.7617, 
      lng: -80.1918, 
      name: 'Miami Edge',
      type: 'edge',
      region: 'us-southeast-1',
      capacity: '15Gbps',
      status: 'operational',
      city: 'Miami'
    },
    'SEA-DC-05': { 
      lat: 47.6062, 
      lng: -122.3321, 
      name: 'Seattle Gateway',
      type: 'gateway',
      region: 'us-northwest-1',
      capacity: '25Gbps',
      status: 'operational',
      city: 'Seattle'
    },
    'DEN-DC-06': { 
      lat: 39.7392, 
      lng: -104.9903, 
      name: 'Denver Regional',
      type: 'regional',
      region: 'us-mountain-1',
      capacity: '20Gbps',
      status: 'maintenance',
      city: 'Denver'
    },
    'ATL-DC-07': { 
      lat: 33.7490, 
      lng: -84.3880, 
      name: 'Atlanta Distribution',
      type: 'distribution',
      region: 'us-south-1',
      capacity: '30Gbps',
      status: 'operational',
      city: 'Atlanta'
    },
    'DAL-DC-08': { 
      lat: 32.7767, 
      lng: -96.7970, 
      name: 'Dallas Access',
      type: 'access',
      region: 'us-southwest-1',
      capacity: '18Gbps',
      status: 'operational',
      city: 'Dallas'
    },
    'PHX-DC-09': { 
      lat: 33.4484, 
      lng: -112.0740, 
      name: 'Phoenix Edge',
      type: 'edge',
      region: 'us-southwest-2',
      capacity: '12Gbps',
      status: 'operational',
      city: 'Phoenix'
    },
    'BOS-DC-10': { 
      lat: 42.3601, 
      lng: -71.0589, 
      
      name: 'Boston Hub',
      type: 'core',
      region: 'us-northeast-1',
      capacity: '28Gbps',
      status: 'operational',
      city: 'Boston'
    },
    'SF-DC-11': { 
      lat: 37.7749, 
      lng: -122.4194,
      name: 'San Francisco Tech Hub',
      type: 'datacenter',
      region: 'us-west-2',
      capacity: '45Gbps',
      status: 'operational',
      city: 'San Francisco'
    },
    'LAS-DC-12': { 
      lat: 36.1699, 
      lng: -115.1398,
      name: 'Las Vegas Edge',
      type: 'edge',
      region: 'us-west-3',
      capacity: '10Gbps',
      status: 'operational',
      city: 'Las Vegas'
    },
    'PDX-DC-13': { 
      lat: 45.5152, 
      lng: -122.6784,
      name: 'Portland Gateway',
      type: 'gateway',
      region: 'us-northwest-2',
      capacity: '16Gbps',
      status: 'operational',
      city: 'Portland'
    },
    'MSP-DC-14': { 
      lat: 44.9778, 
      lng: -93.2650,
      name: 'Minneapolis Regional',
      type: 'regional',
      region: 'us-north-1',
      capacity: '22Gbps',
      status: 'operational',
      city: 'Minneapolis'
    },
    'DET-DC-15': { 
      lat: 42.3314, 
      lng: -83.0458,
      name: 'Detroit Access',
      type: 'access',
      region: 'us-midwest-1',
      capacity: '14Gbps',
      status: 'operational',
      city: 'Detroit'
    }
  };

  const getNodeStatus = (nodeId: string) => {
    const nodeData = telemetryData.filter(d => d.source === nodeId || d.target === nodeId);
    const nodePredictions = predictions.filter(p => p.source === nodeId || p.target === nodeId);
    
    if (nodes[nodeId]?.status === 'maintenance') return 'maintenance';
    if (nodePredictions.some(p => p.sla_violation)) return 'critical';
    if (nodeData.some(d => d.latency > 15)) return 'warning';
    return 'healthy';
  };

  const getConnectionRisk = (source: string, target: string) => {
    const connection = predictions.find(p => 
      (p.source === source && p.target === target) || 
      (p.source === target && p.target === source)
    );
    return connection?.risk_score || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'maintenance': return '#8b5cf6';
      case 'healthy': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk > 0.8) return '#dc2626';
    if (risk > 0.6) return '#ea580c';
    if (risk > 0.4) return '#d97706';
    if (risk > 0.2) return '#65a30d';
    return '#16a34a';
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'datacenter': return Server;
      case 'core': return Cpu;
      case 'edge': return Router;
      case 'gateway': return Wifi;
      case 'regional': return HardDrive;
      case 'distribution': return Activity;
      case 'access': return CheckCircle;
      default: return Server;
    }
  };

  const getNodeSize = (type: string) => {
    switch (type) {
      case 'datacenter': return 25;
      case 'core': return 22;
      case 'gateway': return 20;
      case 'regional': return 18;
      case 'distribution': return 16;
      case 'edge': return 14;
      case 'access': return 12;
      default: return 16;
    }
  };

  // Generate connections between nodes with better logic
  const connections = [];
  const nodeIds = Object.keys(nodes);
  
  // Create strategic connections based on geography and node types
  const strategicConnections = [
    ['NYC-DC-01', 'BOS-DC-10'], // East coast backbone
    ['NYC-DC-01', 'CHI-DC-03'], // Cross-country primary
    ['CHI-DC-03', 'DEN-DC-06'], // Central corridor
    ['DEN-DC-06', 'LAX-DC-02'], // Mountain to west coast
    ['LAX-DC-02', 'SF-DC-11'], // West coast backbone
    ['SF-DC-11', 'SEA-DC-05'], // Pacific northwest
    ['SEA-DC-05', 'PDX-DC-13'], // Regional connection
    ['CHI-DC-03', 'ATL-DC-07'], // Midwest to south
    ['ATL-DC-07', 'MIA-DC-04'], // Southeast corridor
    ['DAL-DC-08', 'PHX-DC-09'], // Southwest connection
    ['CHI-DC-03', 'MSP-DC-14'], // Northern route
    ['MSP-DC-14', 'DET-DC-15'], // Great Lakes
    ['LAX-DC-02', 'LAS-DC-12'], // Desert connection
    ['NYC-DC-01', 'ATL-DC-07'], // East coast to south
    ['SF-DC-11', 'LAS-DC-12']  // Tech hub to entertainment
  ];

  strategicConnections.forEach(([source, target]) => {
    const risk = getConnectionRisk(source, target);
    connections.push({ source, target, risk });
  });

  return (
    <div className="h-[700px] w-full rounded-lg overflow-hidden border bg-card relative">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          className="dark:opacity-60"
        />
        
        {/* Network Connections */}
        {connections.map(({ source, target, risk }) => (
          <Polyline
            key={`${source}-${target}`}
            positions={[
              [nodes[source].lat, nodes[source].lng],
              [nodes[target].lat, nodes[target].lng]
            ]}
            color={getRiskColor(risk)}
            weight={Math.max(3, risk * 8)}
            opacity={0.8}
            className="hover:opacity-100 transition-opacity"
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <h3 className="font-semibold text-sm mb-3">
                  {nodes[source].city} ↔ {nodes[target].city}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Risk Score:</span>
                    <span className="font-medium">{(risk * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={risk * 100} className="h-2" />
                  <div className="flex justify-between">
                    <span>Source:</span>
                    <span className="font-medium">{nodes[source].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <span className="font-medium">{nodes[target].name}</span>
                  </div>
                  <Badge 
                    variant={risk > 0.7 ? 'destructive' : risk > 0.4 ? 'secondary' : 'default'}
                    className="text-xs w-full justify-center mt-2"
                  >
                    {risk > 0.7 ? 'High Risk' : risk > 0.4 ? 'Medium Risk' : 'Low Risk'}
                  </Badge>
                </div>
              </div>
            </Popup>
          </Polyline>
        ))}
        
        {/* Network Nodes */}
        {Object.entries(nodes).map(([nodeId, node]) => {
          const status = getNodeStatus(nodeId);
          const NodeIcon = getNodeIcon(node.type);
          const nodeSize = getNodeSize(node.type);
          
          return (
            <CircleMarker
              key={nodeId}
              center={[node.lat, node.lng]}
              radius={nodeSize}
              fillColor={getStatusColor(status)}
              color="#ffffff"
              weight={3}
              opacity={1}
              fillOpacity={0.9}
              className="hover:scale-110 transition-transform cursor-pointer"
            >
              <Popup>
                <div className="p-4 min-w-[300px]">
                  <div className="flex items-center space-x-3 mb-4">
                    <NodeIcon className="h-6 w-6" />
                    <div>
                      <h3 className="font-semibold text-base">{node.name}</h3>
                      <p className="text-sm text-muted-foreground">{node.city}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div>
                      <span className="text-muted-foreground">Node ID:</span>
                      <p className="font-medium">{nodeId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{node.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Region:</span>
                      <p className="font-medium">{node.region}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Capacity:</span>
                      <p className="font-medium">{node.capacity}</p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={
                      status === 'healthy' ? 'default' : 
                      status === 'maintenance' ? 'secondary' : 'destructive'
                    }
                    className="w-full justify-center mb-3"
                  >
                    {status === 'critical' && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {status === 'warning' && <Activity className="h-3 w-3 mr-1" />}
                    {status === 'healthy' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {status === 'maintenance' && <Server className="h-3 w-3 mr-1" />}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                  
                  {/* Real-time metrics */}
                  {telemetryData.filter(d => d.source === nodeId || d.target === nodeId).length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Current Metrics:</p>
                      {telemetryData
                        .filter(d => d.source === nodeId || d.target === nodeId)
                        .slice(0, 1)
                        .map((data, idx) => (
                          <div key={idx} className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span>Latency:</span>
                              <span className="font-medium">{data.latency?.toFixed(1)}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Throughput:</span>
                              <span className="font-medium">{data.throughput?.toFixed(1)} Mbps</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Packet Loss:</span>
                              <span className="font-medium">{data.packet_loss?.toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Efficiency:</span>
                              <span className="font-medium">{(data.energy_efficiency || 85).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Enhanced Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 z-[1000] shadow-lg">
        <h4 className="font-semibold text-sm mb-3 flex items-center">
          <Layers className="h-4 w-4 mr-2" />
          Network Status
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Healthy ({Object.values(nodes).filter(n => getNodeStatus(Object.keys(nodes).find(k => nodes[k] === n) || '') === 'healthy').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Warning ({Object.values(nodes).filter(n => getNodeStatus(Object.keys(nodes).find(k => nodes[k] === n) || '') === 'warning').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical ({Object.values(nodes).filter(n => getNodeStatus(Object.keys(nodes).find(k => nodes[k] === n) || '') === 'critical').length})</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Maintenance ({Object.values(nodes).filter(n => getNodeStatus(Object.keys(nodes).find(k => nodes[k] === n) || '') === 'maintenance').length})</span>
          </div>
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3 z-[1000] shadow-lg">
        <div className="flex flex-col space-y-2">
          <Button size="sm" variant="outline" className="text-xs">
            <Eye className="h-3 w-3 mr-1" />
            View All
          </Button>
          <Button size="sm" variant="outline" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Alerts Only
          </Button>
        </div>
      </div>

      {/* Network Statistics */}
      <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg p-4 z-[1000] shadow-lg">
        <h4 className="font-semibold text-sm mb-3">Network Stats</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span>Total Nodes:</span>
            <span className="font-medium">{Object.keys(nodes).length}</span>
          </div>
          <div className="flex justify-between">
            <span>Active Connections:</span>
            <span className="font-medium">{connections.length}</span>
          </div>
          <div className="flex justify-between">
            <span>High Risk Links:</span>
            <span className="font-medium text-red-600">
              {connections.filter(c => c.risk > 0.7).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Capacity:</span>
            <span className="font-medium">
              {Object.values(nodes).reduce((sum, node) => 
                sum + parseInt(node.capacity.replace('Gbps', '')), 0
              )}Gbps
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;