import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Eye, AlertTriangle, Activity, TrendingUp, Shield, Zap } from 'lucide-react';

interface AnomalyDetectionProps {
  anomalies: any[];
  telemetryData: any[];
}

const AnomalyDetection: React.FC<AnomalyDetectionProps> = ({ 
  anomalies, 
  telemetryData 
}) => {
  // Prepare anomaly scatter plot data
  const scatterData = telemetryData.map((d, index) => ({
    latency: d.latency,
    throughput: d.throughput,
    isAnomaly: anomalies.some(a => 
      Math.abs(a.latency - d.latency) < 0.1 && 
      Math.abs(a.throughput - d.throughput) < 0.1
    ),
    index
  }));

  // Anomaly timeline data
  const timelineData = telemetryData.slice(-20).map((d, i) => ({
    time: i,
    latency: d.latency,
    anomalyThreshold: 15,
    isAnomaly: d.latency > 15 || d.packet_loss > 20
  }));

  const anomalyRate = telemetryData.length > 0 
    ? (anomalies.length / telemetryData.length) * 100 
    : 0;

  const avgAnomalyScore = anomalies.length > 0
    ? anomalies.reduce((sum, a) => sum + (a.anomaly_score || 0), 0) / anomalies.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Anomaly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Anomalies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{anomalies.length}</div>
            <p className="text-xs text-muted-foreground">Detected in current session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anomaly Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anomalyRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of total network events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Anomaly Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(avgAnomalyScore * 100).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average severity level</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {anomalies.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{anomalies.length} anomalies detected</strong> in the network. 
            Latest: {anomalies[0]?.explanation || 'High latency detected'}
          </AlertDescription>
        </Alert>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Timeline</CardTitle>
            <CardDescription>Network latency with anomaly detection threshold</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'latency' ? 'ms' : ''}`, 
                    name === 'latency' ? 'Latency' : 'Threshold'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={payload.isAnomaly ? "#ef4444" : "#3b82f6"}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="anomalyThreshold" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latency vs Throughput</CardTitle>
            <CardDescription>Anomaly detection in network performance space</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="latency" name="Latency" unit="ms" />
                <YAxis dataKey="throughput" name="Throughput" unit="Mbps" />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'latency' ? 'ms' : ' Mbps'}`, 
                    name === 'latency' ? 'Latency' : 'Throughput'
                  ]}
                />
                <Scatter 
                  dataKey="throughput" 
                  fill={(entry) => entry.isAnomaly ? "#ef4444" : "#3b82f6"}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Anomalies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Recent Anomalies</span>
          </CardTitle>
          <CardDescription>
            Detailed view of detected network anomalies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {anomalies.length > 0 ? (
              anomalies.slice(0, 5).map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{anomaly.explanation}</h4>
                      <p className="text-sm text-muted-foreground">
                        {anomaly.source} → {anomaly.target} • {new Date(anomaly.timestamp).toLocaleTimeString()}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <span>Latency: {anomaly.latency?.toFixed(1)}ms</span>
                        <span>Packet Loss: {anomaly.packet_loss?.toFixed(1)}%</span>
                        <span>Jitter: {anomaly.jitter?.toFixed(1)}ms</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">
                      {((anomaly.anomaly_score || 0) * 100).toFixed(1)}%
                    </Badge>
                    <div className="mt-2 w-24">
                      <Progress 
                        value={(anomaly.anomaly_score || 0) * 100} 
                        className="h-1"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No anomalies detected</p>
                <p className="text-sm">Network is operating within normal parameters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Detection Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Detection Configuration</span>
          </CardTitle>
          <CardDescription>
            Anomaly detection model parameters and thresholds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Detection Thresholds</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Latency Threshold:</span>
                  <span className="text-sm font-medium">15ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Packet Loss Threshold:</span>
                  <span className="text-sm font-medium">20%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Jitter Threshold:</span>
                  <span className="text-sm font-medium">5ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Anomaly Score Threshold:</span>
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Model Performance</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Detection Accuracy:</span>
                  <span className="text-sm font-medium">92.3%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">False Positive Rate:</span>
                  <span className="text-sm font-medium">3.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Model Type:</span>
                  <span className="text-sm font-medium">Isolation Forest</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Updated:</span>
                  <span className="text-sm font-medium">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetection;