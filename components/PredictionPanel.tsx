import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface PredictionPanelProps {
  onPredict: (data: any) => void;
  predictions: any[];
  isLoading: boolean;
}

const PredictionPanel: React.FC<PredictionPanelProps> = ({ 
  onPredict, 
  predictions, 
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    bandwidth: '2.0',
    throughput: '2.0',
    congestion: '0.1',
    packet_loss: '0.0',
    latency: '6.0',
    jitter: '0.5',
    source: 'S1',
    target: 'S2'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericData = {
      ...formData,
      bandwidth: parseFloat(formData.bandwidth),
      throughput: parseFloat(formData.throughput),
      congestion: parseFloat(formData.congestion),
      packet_loss: parseFloat(formData.packet_loss),
      latency: parseFloat(formData.latency),
      jitter: parseFloat(formData.jitter)
    };
    onPredict(numericData);
  };

  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Prediction Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Manual Prediction</span>
          </CardTitle>
          <CardDescription>
            Input network metrics to predict SLA violation probability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bandwidth">Bandwidth (Mbps)</Label>
                <Input
                  id="bandwidth"
                  type="number"
                  step="0.1"
                  value={formData.bandwidth}
                  onChange={(e) => handleInputChange('bandwidth', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="throughput">Throughput (Mbps)</Label>
                <Input
                  id="throughput"
                  type="number"
                  step="0.1"
                  value={formData.throughput}
                  onChange={(e) => handleInputChange('throughput', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latency">Latency (ms)</Label>
                <Input
                  id="latency"
                  type="number"
                  step="0.1"
                  value={formData.latency}
                  onChange={(e) => handleInputChange('latency', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="jitter">Jitter (ms)</Label>
                <Input
                  id="jitter"
                  type="number"
                  step="0.1"
                  value={formData.jitter}
                  onChange={(e) => handleInputChange('jitter', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="congestion">Congestion (%)</Label>
                <Input
                  id="congestion"
                  type="number"
                  step="0.1"
                  value={formData.congestion}
                  onChange={(e) => handleInputChange('congestion', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="packet_loss">Packet Loss (%)</Label>
                <Input
                  id="packet_loss"
                  type="number"
                  step="0.1"
                  value={formData.packet_loss}
                  onChange={(e) => handleInputChange('packet_loss', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source">Source Node</Label>
                <select
                  id="source"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="mt-1 w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="S1">S1 - New York</option>
                  <option value="S2">S2 - Los Angeles</option>
                  <option value="S3">S3 - Chicago</option>
                </select>
              </div>
              <div>
                <Label htmlFor="target">Target Node</Label>
                <select
                  id="target"
                  value={formData.target}
                  onChange={(e) => handleInputChange('target', e.target.value)}
                  className="mt-1 w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                >
                  <option value="S1">S1 - New York</option>
                  <option value="S2">S2 - Los Angeles</option>
                  <option value="S3">S3 - Chicago</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Predicting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Generate Prediction
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Prediction Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Prediction Results</span>
          </CardTitle>
          <CardDescription>
            Latest SLA violation prediction and model insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestPrediction ? (
            <div className="space-y-6">
              {/* Main Result */}
              <div className="text-center p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div className="flex items-center justify-center mb-3">
                  {latestPrediction.sla_violation ? (
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {latestPrediction.sla_violation ? 'SLA Violation Predicted' : 'SLA Compliance Expected'}
                </h3>
                <Badge 
                  variant={latestPrediction.sla_violation ? 'destructive' : 'default'}
                  className="text-lg px-4 py-2"
                >
                  {(latestPrediction.risk_score * 100).toFixed(1)}% Risk
                </Badge>
              </div>

              <Separator />

              {/* Detailed Metrics */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Risk Score</span>
                    <span className="text-sm text-muted-foreground">
                      {(latestPrediction.risk_score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={latestPrediction.risk_score * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Model Confidence</span>
                    <span className="text-sm text-muted-foreground">
                      {(latestPrediction.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={latestPrediction.confidence * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 border rounded">
                    <p className="text-sm text-muted-foreground">Connection</p>
                    <p className="font-semibold">
                      {latestPrediction.source} → {latestPrediction.target}
                    </p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="font-semibold">
                      {new Date(latestPrediction.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Input Summary */}
              <div>
                <h4 className="font-medium mb-3">Input Parameters</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Latency:</span>
                    <span>{latestPrediction.latency?.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jitter:</span>
                    <span>{latestPrediction.jitter?.toFixed(1)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Throughput:</span>
                    <span>{latestPrediction.throughput?.toFixed(1)} Mbps</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packet Loss:</span>
                    <span>{latestPrediction.packet_loss?.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No predictions generated yet</p>
              <p className="text-sm">Use the form to generate your first prediction</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictionPanel;