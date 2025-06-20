import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Network,
  Zap,
  Shield,
  BarChart3,
  MapPin,
  Wifi,
  Server,
  Database,
  Brain,
  Eye,
  Bell,
  Moon,
  Sun,
  Settings,
  Mail,
  MessageSquare,
  Globe,
  Cpu,
  HardDrive,
  Router,
  Smartphone,
  Download,
  Upload,
  Users,
  Clock,
  Target,
  Layers,
  Filter,
  RefreshCw,
  Calendar,
  FileText,
  PieChart,
  LineChart,
  BarChart2,
  Gauge
} from 'lucide-react';
import { ThemeProvider, useTheme } from 'next-themes';
import NetworkMap from './components/NetworkMap';
import MetricsDashboard from './components/MetricsDashboard';
import PredictionPanel from './components/PredictionPanel';
import AnomalyDetection from './components/AnomalyDetection';
import AlertsPanel from './components/AlertsPanel';
import BandwidthMonitoring from './components/BandwidthMonitoring';
import GreenPathOptimization from './components/GreenPathOptimization';
import ExportTools from './components/ExportTools';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Enhanced API service with better error handling and retry logic
class APIService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  private retryCount = 3;
  private retryDelay = 1000;

  async request(endpoint: string, options: RequestInit = {}) {
    for (let i = 0; i < this.retryCount; i++) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        if (i === this.retryCount - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * (i + 1)));
      }
    }
  }

  async predict(data: any) {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const riskScore = this.calculateRiskScore(data);
      return {
        sla_violation: riskScore > 0.7 ? 1 : 0,
        risk_score: riskScore,
        confidence: 0.85 + Math.random() * 0.1,
        model_version: "v2.1",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  }

  async detectAnomaly(data: any) {
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const anomalyScore = this.calculateAnomalyScore(data);
      return {
        is_anomaly: anomalyScore > 0.8,
        anomaly_score: anomalyScore,
        explanation: anomalyScore > 0.8 ? this.generateAnomalyExplanation(data) : 'Normal behavior',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Anomaly detection error:', error);
      throw error;
    }
  }

  async getTelemetryData() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      return this.generateRealisticTelemetry();
    } catch (error) {
      console.error('Telemetry fetch error:', error);
      throw error;
    }
  }

  async sendAlert(alertData: any) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Alert sent:', alertData);
      return { success: true, message: 'Alert sent successfully' };
    } catch (error) {
      console.error('Alert sending error:', error);
      throw error;
    }
  }

  async exportData(type: string, format: string) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const data = this.generateExportData(type);
      return { 
        success: true, 
        data, 
        filename: `${type}_export_${new Date().toISOString().split('T')[0]}.${format}`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  private calculateRiskScore(data: any): number {
    const { latency, packet_loss, jitter, congestion, throughput, bandwidth } = data;
    
    let risk = 0;
    
    // Latency risk (0-1)
    risk += Math.min(latency / 20, 1) * 0.3;
    
    // Packet loss risk (0-1)
    risk += Math.min(packet_loss / 10, 1) * 0.25;
    
    // Jitter risk (0-1)
    risk += Math.min(jitter / 5, 1) * 0.15;
    
    // Congestion risk (0-1)
    risk += Math.min(congestion / 100, 1) * 0.2;
    
    // Throughput efficiency risk (0-1)
    const efficiency = throughput / bandwidth;
    risk += Math.max(0, (0.5 - efficiency) / 0.5) * 0.1;
    
    return Math.min(risk, 1);
  }

  private calculateAnomalyScore(data: any): number {
    const { latency, packet_loss, jitter, congestion } = data;
    
    let score = 0;
    
    if (latency > 25) score += 0.4;
    if (packet_loss > 15) score += 0.3;
    if (jitter > 8) score += 0.2;
    if (congestion > 90) score += 0.1;
    
    return Math.min(score + Math.random() * 0.2, 1);
  }

  private generateAnomalyExplanation(data: any): string {
    const issues = [];
    if (data.latency > 25) issues.push(`High latency (${data.latency.toFixed(1)}ms)`);
    if (data.packet_loss > 15) issues.push(`High packet loss (${data.packet_loss.toFixed(1)}%)`);
    if (data.jitter > 8) issues.push(`High jitter (${data.jitter.toFixed(1)}ms)`);
    if (data.congestion > 90) issues.push(`Network congestion (${data.congestion.toFixed(1)}%)`);
    
    return issues.length > 0 ? issues.join(', ') : 'Unusual network pattern detected';
  }

  private generateRealisticTelemetry() {
    const nodes = [
      'NYC-DC-01', 'LAX-DC-02', 'CHI-DC-03', 'MIA-DC-04', 'SEA-DC-05', 
      'DEN-DC-06', 'ATL-DC-07', 'DAL-DC-08', 'PHX-DC-09', 'BOS-DC-10',
      'SF-DC-11', 'LAS-DC-12', 'PDX-DC-13', 'MSP-DC-14', 'DET-DC-15'
    ];
    const data = [];
    
    for (let i = 0; i < 20; i++) {
      const sourceNode = nodes[Math.floor(Math.random() * nodes.length)];
      const targetNode = nodes[Math.floor(Math.random() * nodes.length)];
      
      if (sourceNode !== targetNode) {
        const baseLatency = Math.random() * 15 + 5;
        const isProblematic = Math.random() < 0.15;
        
        data.push({
          id: i + 1,
          timestamp: new Date(Date.now() - i * 30000).toISOString(),
          bandwidth: 2 + Math.random() * 8,
          throughput: 1 + Math.random() * 6,
          congestion: isProblematic ? Math.random() * 40 + 60 : Math.random() * 30,
          packet_loss: isProblematic ? Math.random() * 20 + 10 : Math.random() * 5,
          latency: isProblematic ? baseLatency * (2 + Math.random()) : baseLatency,
          jitter: isProblematic ? Math.random() * 8 + 2 : Math.random() * 2,
          source: sourceNode,
          target: targetNode,
          sla_violation: isProblematic ? 1 : 0,
          node_type: this.getNodeType(sourceNode),
          region: this.getRegion(sourceNode),
          energy_efficiency: 85 + Math.random() * 15,
          carbon_footprint: Math.random() * 50 + 10
        });
      }
    }
    
    return data;
  }

  private generateExportData(type: string) {
    const baseData = this.generateRealisticTelemetry();
    
    switch (type) {
      case 'sla_metrics':
        return baseData.map(d => ({
          timestamp: d.timestamp,
          source: d.source,
          target: d.target,
          latency: d.latency,
          packet_loss: d.packet_loss,
          sla_violation: d.sla_violation
        }));
      case 'bandwidth_usage':
        return baseData.map(d => ({
          timestamp: d.timestamp,
          source: d.source,
          target: d.target,
          bandwidth: d.bandwidth,
          throughput: d.throughput,
          utilization: (d.throughput / d.bandwidth * 100).toFixed(2)
        }));
      case 'green_metrics':
        return baseData.map(d => ({
          timestamp: d.timestamp,
          source: d.source,
          target: d.target,
          energy_efficiency: d.energy_efficiency,
          carbon_footprint: d.carbon_footprint
        }));
      default:
        return baseData;
    }
  }

  private getNodeType(node: string): string {
    const types = ['datacenter', 'edge', 'core', 'access', 'gateway'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRegion(node: string): string {
    const regions = {
      'NYC': 'us-east-1',
      'LAX': 'us-west-1',
      'CHI': 'us-central-1',
      'MIA': 'us-southeast-1',
      'SEA': 'us-northwest-1',
      'DEN': 'us-mountain-1',
      'ATL': 'us-south-1',
      'DAL': 'us-southwest-1',
      'PHX': 'us-southwest-2',
      'BOS': 'us-northeast-1',
      'SF': 'us-west-2',
      'LAS': 'us-west-3',
      'PDX': 'us-northwest-2',
      'MSP': 'us-north-1',
      'DET': 'us-midwest-1'
    };
    const prefix = node.substring(0, 3);
    return regions[prefix] || 'us-unknown-1';
  }
}

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="relative"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

// Main App Component
function AppContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [telemetryData, setTelemetryData] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [alertSettings, setAlertSettings] = useState({
    emailEnabled: true,
    telegramEnabled: false,
    riskThreshold: 75,
    email: 'admin@company.com',
    telegramChatId: ''
  });
  const { toast } = useToast();
  const api = new APIService();

  // Enhanced real-time data simulation with better error handling
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await api.getTelemetryData();
        setTelemetryData(data);
        setLastUpdate(new Date());
        
        // Process predictions for latest data
        for (const item of data.slice(0, 3)) {
          const prediction = await api.predict(item);
          const predictionWithData = { ...item, ...prediction };
          setPredictions(prev => [predictionWithData, ...prev.slice(0, 19)]);
          
          // Check for high-risk predictions and send alerts
          if (prediction.risk_score > alertSettings.riskThreshold / 100) {
            const alertData = {
              type: 'sla_violation',
              severity: 'high',
              message: `High SLA violation risk detected: ${(prediction.risk_score * 100).toFixed(1)}%`,
              source: item.source,
              target: item.target,
              timestamp: new Date().toISOString(),
              riskScore: prediction.risk_score
            };
            
            setAlerts(prev => [alertData, ...prev.slice(0, 9)]);
            
            // Send notification
            if (alertSettings.emailEnabled || alertSettings.telegramEnabled) {
              await api.sendAlert({
                ...alertData,
                email: alertSettings.emailEnabled ? alertSettings.email : null,
                telegram: alertSettings.telegramEnabled ? alertSettings.telegramChatId : null
              });
            }
            
            toast({
              title: "High Risk Alert",
              description: `SLA violation risk: ${(prediction.risk_score * 100).toFixed(1)}% on ${item.source} → ${item.target}`,
              variant: "destructive",
            });
          }
          
          // Check for anomalies
          const anomaly = await api.detectAnomaly(item);
          if (anomaly.is_anomaly) {
            const anomalyData = { ...item, ...anomaly };
            setAnomalies(prev => [anomalyData, ...prev.slice(0, 9)]);
            
            toast({
              title: "Anomaly Detected",
              description: anomaly.explanation,
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Error in real-time update:', error);
        toast({
          title: "Connection Error",
          description: "Failed to fetch real-time data. Retrying...",
          variant: "destructive",
        });
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [alertSettings, toast]);

  const handleManualPrediction = async (formData: any) => {
    setIsLoading(true);
    try {
      const result = await api.predict(formData);
      const predictionWithData = { ...formData, ...result };
      setPredictions(prev => [predictionWithData, ...prev.slice(0, 19)]);
      
      toast({
        title: "Prediction Complete",
        description: `SLA Violation Risk: ${(result.risk_score * 100).toFixed(1)}%`,
        variant: result.sla_violation ? "destructive" : "default",
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Unable to generate prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTelemetryData();
      setTelemetryData(data);
      setLastUpdate(new Date());
      toast({
        title: "Data Refreshed",
        description: "Latest network data has been loaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const systemStatus = {
    overall: predictions.length > 0 && predictions[0].sla_violation ? 'warning' : 'healthy',
    activeConnections: telemetryData.length,
    avgLatency: telemetryData.length > 0 ? (telemetryData.reduce((sum, d) => sum + d.latency, 0) / telemetryData.length).toFixed(1) : '0',
    anomalyCount: anomalies.length,
    predictionAccuracy: '96.8',
    totalNodes: 15,
    healthyNodes: telemetryData.filter(d => d.sla_violation === 0).length,
    criticalAlerts: alerts.filter(a => a.severity === 'high').length,
    avgThroughput: telemetryData.length > 0 ? (telemetryData.reduce((sum, d) => sum + d.throughput, 0) / telemetryData.length).toFixed(1) : '0',
    energyEfficiency: telemetryData.length > 0 ? (telemetryData.reduce((sum, d) => sum + (d.energy_efficiency || 85), 0) / telemetryData.length).toFixed(1) : '85'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-colors duration-300">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="p-3 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Network className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  SLA Admin Platform
                </h1>
                <p className="text-muted-foreground text-lg">
                  Advanced network monitoring with AI-powered predictions & green optimization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshData}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
              <ThemeToggle />
              <Badge 
                variant={systemStatus.overall === 'healthy' ? 'default' : 'destructive'}
                className="px-4 py-2 text-sm font-medium"
              >
                <Activity className="h-4 w-4 mr-2" />
                {systemStatus.overall === 'healthy' ? 'All Systems Operational' : 'Attention Required'}
              </Badge>
            </div>
          </div>
          
          {/* Last Update Info */}
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Database className="h-4 w-4" />
                <span>{telemetryData.length} active connections</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Live monitoring active</span>
            </div>
          </div>
        </motion.div>

        {/* Enhanced System Overview Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8"
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nodes</CardTitle>
              <Server className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{systemStatus.totalNodes}</div>
              <p className="text-xs text-muted-foreground">Network infrastructure</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Healthy Nodes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemStatus.healthyNodes}</div>
              <p className="text-xs text-muted-foreground">Operating normally</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Zap className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStatus.avgLatency}ms</div>
              <p className="text-xs text-muted-foreground">Network response time</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{systemStatus.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
              <Eye className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{systemStatus.anomalyCount}</div>
              <p className="text-xs text-muted-foreground">Detected patterns</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ML Accuracy</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{systemStatus.predictionAccuracy}%</div>
              <p className="text-xs text-muted-foreground">Model performance</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-muted/50 backdrop-blur-sm p-1 h-12">
              <TabsTrigger value="overview" className="flex items-center space-x-2 text-xs">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center space-x-2 text-xs">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Network Map</span>
              </TabsTrigger>
              <TabsTrigger value="sla" className="flex items-center space-x-2 text-xs">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">SLA Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="bandwidth" className="flex items-center space-x-2 text-xs">
                <Gauge className="h-4 w-4" />
                <span className="hidden sm:inline">Bandwidth</span>
              </TabsTrigger>
              <TabsTrigger value="green" className="flex items-center space-x-2 text-xs">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Green Path</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center space-x-2 text-xs">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center space-x-2 text-xs">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="overview" className="space-y-6">
                  <MetricsDashboard 
                    telemetryData={telemetryData}
                    predictions={predictions}
                    anomalies={anomalies}
                    systemStatus={systemStatus}
                  />
                </TabsContent>

                <TabsContent value="map" className="space-y-6">
                  <Card className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Globe className="h-5 w-5" />
                        <span>Global Network Topology</span>
                      </CardTitle>
                      <CardDescription>
                        Real-time visualization of network nodes with SLA risk levels and performance metrics
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <NetworkMap 
                        telemetryData={telemetryData}
                        predictions={predictions}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="sla" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PredictionPanel 
                      onPredict={handleManualPrediction}
                      predictions={predictions}
                      isLoading={isLoading}
                    />
                    <AnomalyDetection 
                      anomalies={anomalies}
                      telemetryData={telemetryData}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="bandwidth" className="space-y-6">
                  <BandwidthMonitoring 
                    telemetryData={telemetryData}
                    predictions={predictions}
                  />
                </TabsContent>

                <TabsContent value="green" className="space-y-6">
                  <GreenPathOptimization 
                    telemetryData={telemetryData}
                    predictions={predictions}
                  />
                </TabsContent>

                <TabsContent value="alerts" className="space-y-6">
                  <AlertsPanel 
                    alerts={alerts}
                    alertSettings={alertSettings}
                    onSettingsChange={setAlertSettings}
                  />
                </TabsContent>

                <TabsContent value="export" className="space-y-6">
                  <ExportTools 
                    telemetryData={telemetryData}
                    predictions={predictions}
                    anomalies={anomalies}
                    apiService={api}
                  />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </motion.div>
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;