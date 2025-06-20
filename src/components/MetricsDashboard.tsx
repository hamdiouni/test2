import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock, Zap, Gauge } from 'lucide-react';
import Chart from 'react-apexcharts';

interface MetricsDashboardProps {
  telemetryData: any[];
  predictions: any[];
  anomalies: any[];
  systemStatus: any;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ 
  telemetryData, 
  predictions, 
  anomalies,
  systemStatus 
}) => {
  // Prepare chart data with better formatting
  const latencyData = {
    series: [{
      name: 'Latency',
      data: telemetryData.slice(-20).map((d, i) => ({
        x: i,
        y: d.latency.toFixed(1)
      }))
    }, {
      name: 'SLA Threshold',
      data: telemetryData.slice(-20).map((d, i) => ({
        x: i,
        y: 10
      }))
    }],
    options: {
      chart: {
        type: 'line',
        height: 350,
        toolbar: { show: false },
        background: 'transparent'
      },
      theme: {
        mode: 'dark'
      },
      stroke: {
        curve: 'smooth',
        width: [3, 2]
      },
      colors: ['#3b82f6', '#ef4444'],
      xaxis: {
        title: { text: 'Time' },
        labels: { style: { colors: '#9ca3af' } }
      },
      yaxis: {
        title: { text: 'Latency (ms)' },
        labels: { style: { colors: '#9ca3af' } }
      },
      grid: {
        borderColor: '#374151'
      },
      tooltip: {
        theme: 'dark'
      },
      legend: {
        labels: { colors: '#9ca3af' }
      }
    }
  };

  const throughputData = {
    series: [
      {
        name: 'Throughput',
        data: telemetryData.slice(-15).map(d => d.throughput.toFixed(1))
      },
      {
        name: 'Bandwidth',
        data: telemetryData.slice(-15).map(d => d.bandwidth.toFixed(1))
      }
    ],
    options: {
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false },
        background: 'transparent'
      },
      theme: {
        mode: 'dark'
      },
      colors: ['#10b981', '#6366f1'],
      xaxis: {
        categories: telemetryData.slice(-15).map((d, i) => `T${i + 1}`),
        labels: { style: { colors: '#9ca3af' } }
      },
      yaxis: {
        title: { text: 'Mbps' },
        labels: { style: { colors: '#9ca3af' } }
      },
      grid: {
        borderColor: '#374151'
      },
      tooltip: {
        theme: 'dark'
      },
      legend: {
        labels: { colors: '#9ca3af' }
      }
    }
  };

  const riskDistribution = {
    series: [
      predictions.filter(p => p.risk_score < 0.3).length,
      predictions.filter(p => p.risk_score >= 0.3 && p.risk_score < 0.7).length,
      predictions.filter(p => p.risk_score >= 0.7).length
    ],
    options: {
      chart: {
        type: 'donut',
        height: 350,
        background: 'transparent'
      },
      theme: {
        mode: 'dark'
      },
      labels: ['Low Risk', 'Medium Risk', 'High Risk'],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      legend: {
        labels: { colors: '#9ca3af' }
      },
      tooltip: {
        theme: 'dark'
      },
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                formatter: () => predictions.length.toString()
              }
            }
          }
        }
      }
    }
  };

  const performanceGaugeData = {
    series: [parseFloat(systemStatus.predictionAccuracy)],
    options: {
      chart: {
        type: 'radialBar',
        height: 300,
        background: 'transparent'
      },
      theme: {
        mode: 'dark'
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '60%'
          },
          dataLabels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              color: '#9ca3af'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#3b82f6',
              formatter: (val: number) => `${val}%`
            }
          }
        }
      },
      colors: ['#3b82f6'],
      labels: ['ML Accuracy']
    }
  };

  const avgLatency = telemetryData.length > 0 
    ? telemetryData.reduce((sum, d) => sum + d.latency, 0) / telemetryData.length 
    : 0;

  const avgThroughput = telemetryData.length > 0 
    ? telemetryData.reduce((sum, d) => sum + d.throughput, 0) / telemetryData.length 
    : 0;

  const slaViolations = predictions.filter(p => p.sla_violation).length;
  const totalPredictions = predictions.length;

  return (
    <div className="space-y-6">
      {/* Enhanced Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Latency</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{avgLatency.toFixed(1)}ms</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {avgLatency > 10 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span className="text-red-500">Above threshold</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Within limits</span>
                  </>
                )}
              </div>
              <Progress value={Math.min((avgLatency / 20) * 100, 100)} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Throughput</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{avgThroughput.toFixed(1)} Mbps</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>Network utilization</span>
              </div>
              <Progress value={Math.min((avgThroughput / 10) * 100, 100)} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Violations</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{slaViolations}</div>
              <div className="text-xs text-muted-foreground">
                {totalPredictions > 0 ? `${((slaViolations / totalPredictions) * 100).toFixed(1)}% of predictions` : 'No data'}
              </div>
              <Progress 
                value={totalPredictions > 0 ? (slaViolations / totalPredictions) * 100 : 0} 
                className="mt-2 h-1" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomalies</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{anomalies.length}</div>
              <div className="text-xs text-muted-foreground">
                Detected in last hour
              </div>
              <Progress value={Math.min(anomalies.length * 10, 100)} className="mt-2 h-1" />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Charts Section */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Latency Monitoring</CardTitle>
                <CardDescription>Real-time latency with SLA threshold</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  options={latencyData.options}
                  series={latencyData.series}
                  type="line"
                  height={350}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ML Model Performance</CardTitle>
                <CardDescription>Prediction accuracy and confidence</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  options={performanceGaugeData.options}
                  series={performanceGaugeData.series}
                  type="radialBar"
                  height={300}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>SLA violation risk levels across network</CardDescription>
              </CardHeader>
              <CardContent>
                <Chart
                  options={riskDistribution.options}
                  series={riskDistribution.series}
                  type="donut"
                  height={350}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent High-Risk Predictions</CardTitle>
                <CardDescription>Latest predictions with elevated risk scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[350px] overflow-y-auto">
                  {predictions
                    .filter(p => p.risk_score > 0.5)
                    .slice(0, 6)
                    .map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          prediction.risk_score > 0.7 ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">
                            {prediction.source} → {prediction.target}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(prediction.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={prediction.risk_score > 0.7 ? 'destructive' : 'secondary'}>
                        {(prediction.risk_score * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  ))}
                  {predictions.filter(p => p.risk_score > 0.5).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No high-risk predictions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Throughput vs Bandwidth Comparison</CardTitle>
              <CardDescription>Network utilization efficiency over time</CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                options={throughputData.options}
                series={throughputData.series}
                type="bar"
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Network Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Overall Status:</span>
                    <Badge variant={systemStatus.overall === 'healthy' ? 'default' : 'destructive'}>
                      {systemStatus.overall}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Active Nodes:</span>
                    <span className="text-sm font-medium">{systemStatus.totalNodes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Healthy Nodes:</span>
                    <span className="text-sm font-medium text-green-600">{systemStatus.healthyNodes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Latency:</span>
                    <span className="text-sm font-medium">{systemStatus.avgLatency}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Throughput:</span>
                    <span className="text-sm font-medium">{systemStatus.avgThroughput} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ML Accuracy:</span>
                    <span className="text-sm font-medium text-purple-600">{systemStatus.predictionAccuracy}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alert Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Critical Alerts:</span>
                    <span className="text-sm font-medium text-red-600">{systemStatus.criticalAlerts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Anomalies:</span>
                    <span className="text-sm font-medium text-orange-600">{systemStatus.anomalyCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">SLA Violations:</span>
                    <span className="text-sm font-medium text-red-600">{slaViolations}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsDashboard;