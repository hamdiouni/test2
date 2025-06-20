import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Database, 
  Calendar, 
  Filter,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Mail,
  Share,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportToolsProps {
  telemetryData: any[];
  predictions: any[];
  anomalies: any[];
  apiService: any;
}

const ExportTools: React.FC<ExportToolsProps> = ({ 
  telemetryData, 
  predictions, 
  anomalies, 
  apiService 
}) => {
  const [selectedDataType, setSelectedDataType] = useState('sla_metrics');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFields, setSelectedFields] = useState({
    timestamp: true,
    source: true,
    target: true,
    latency: true,
    throughput: true,
    packet_loss: true,
    sla_violation: true,
    risk_score: false,
    energy_efficiency: false,
    carbon_footprint: false
  });
  const { toast } = useToast();

  const dataTypes = [
    {
      id: 'sla_metrics',
      name: 'SLA Metrics',
      description: 'SLA violation data and performance metrics',
      icon: BarChart3,
      count: predictions.length
    },
    {
      id: 'bandwidth_usage',
      name: 'Bandwidth Usage',
      description: 'Network bandwidth utilization data',
      icon: LineChart,
      count: telemetryData.length
    },
    {
      id: 'anomaly_reports',
      name: 'Anomaly Reports',
      description: 'Detected network anomalies and explanations',
      icon: PieChart,
      count: anomalies.length
    },
    {
      id: 'green_metrics',
      name: 'Green Metrics',
      description: 'Energy efficiency and carbon footprint data',
      icon: Database,
      count: telemetryData.length
    },
    {
      id: 'full_telemetry',
      name: 'Full Telemetry',
      description: 'Complete network telemetry dataset',
      icon: Table,
      count: telemetryData.length
    }
  ];

  const formats = [
    { id: 'csv', name: 'CSV', description: 'Comma-separated values' },
    { id: 'json', name: 'JSON', description: 'JavaScript Object Notation' },
    { id: 'xlsx', name: 'Excel', description: 'Microsoft Excel format' },
    { id: 'pdf', name: 'PDF', description: 'Portable Document Format' }
  ];

  const timeRanges = [
    { id: '1h', name: 'Last Hour' },
    { id: '6h', name: 'Last 6 Hours' },
    { id: '24h', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' },
    { id: 'all', name: 'All Time' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await apiService.exportData(selectedDataType, selectedFormat);
      
      clearInterval(progressInterval);
      setExportProgress(100);

      // Simulate file download
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: `${result.filename} has been downloaded successfully.`,
        });

        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to export data. Please try again.",
        variant: "destructive",
      });
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const selectedDataTypeInfo = dataTypes.find(dt => dt.id === selectedDataType);

  return (
    <div className="space-y-6">
      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Selection</span>
            </CardTitle>
            <CardDescription>
              Choose the type of data you want to export
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {dataTypes.map((dataType) => {
                const IconComponent = dataType.icon;
                return (
                  <motion.div
                    key={dataType.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedDataType === dataType.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedDataType(dataType.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{dataType.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {dataType.description}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {dataType.count} records
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Export Settings</span>
            </CardTitle>
            <CardDescription>
              Configure export format and time range
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                <SelectTrigger>
                  <FileText className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formats.map(format => (
                    <SelectItem key={format.id} value={format.id}>
                      <div>
                        <div className="font-medium">{format.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {format.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Range</label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.id} value={range.id}>
                      {range.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleExport} 
                disabled={isExporting}
                className="w-full"
              >
                {isExporting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </>
                )}
              </Button>
              
              {isExporting && (
                <div className="mt-3">
                  <Progress value={exportProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {exportProgress}% complete
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Field Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Field Selection</span>
          </CardTitle>
          <CardDescription>
            Choose which fields to include in your export
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(selectedFields).map(([field, checked]) => (
              <div key={field} className="flex items-center space-x-2">
                <Checkbox
                  id={field}
                  checked={checked}
                  onCheckedChange={() => handleFieldToggle(field)}
                />
                <label
                  htmlFor={field}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {field.replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Export Preview</span>
          </CardTitle>
          <CardDescription>
            Preview of the data that will be exported
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <h4 className="font-medium">{selectedDataTypeInfo?.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDataTypeInfo?.description}
                </p>
              </div>
              <Badge variant="outline">
                {selectedDataTypeInfo?.count} records
              </Badge>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3 border-b">
                <h5 className="font-medium text-sm">Sample Data</h5>
              </div>
              <div className="p-3">
                <div className="text-xs font-mono bg-background p-3 rounded border overflow-x-auto">
                  {selectedFormat === 'json' ? (
                    <pre>{JSON.stringify({
                      timestamp: "2024-01-15T10:30:00Z",
                      source: "NYC-DC-01",
                      target: "LAX-DC-02",
                      latency: 12.5,
                      throughput: 2.3,
                      packet_loss: 0.1,
                      sla_violation: 0
                    }, null, 2)}</pre>
                  ) : (
                    <div>
                      timestamp,source,target,latency,throughput,packet_loss,sla_violation<br/>
                      2024-01-15T10:30:00Z,NYC-DC-01,LAX-DC-02,12.5,2.3,0.1,0<br/>
                      2024-01-15T10:31:00Z,CHI-DC-03,MIA-DC-04,8.2,3.1,0.0,0<br/>
                      ...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Exports</span>
          </CardTitle>
          <CardDescription>
            History of your recent data exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                filename: 'sla_metrics_2024-01-15.csv',
                type: 'SLA Metrics',
                format: 'CSV',
                size: '2.3 MB',
                date: '2024-01-15 14:30',
                status: 'completed'
              },
              {
                filename: 'bandwidth_usage_2024-01-14.xlsx',
                type: 'Bandwidth Usage',
                format: 'Excel',
                size: '1.8 MB',
                date: '2024-01-14 09:15',
                status: 'completed'
              },
              {
                filename: 'anomaly_reports_2024-01-13.json',
                type: 'Anomaly Reports',
                format: 'JSON',
                size: '0.9 MB',
                date: '2024-01-13 16:45',
                status: 'completed'
              }
            ].map((export_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{export_.filename}</h4>
                    <p className="text-xs text-muted-foreground">
                      {export_.type} • {export_.format} • {export_.size}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{export_.date}</p>
                  <Button size="sm" variant="outline" className="mt-1">
                    <Download className="h-3 w-3 mr-1" />
                    Download
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scheduled Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Set up automatic data exports on a schedule
            </p>
            <Button variant="outline" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Export
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Send exported data directly to email recipients
            </p>
            <Button variant="outline" className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Email Export
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Share Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Generate shareable links to dashboard views
            </p>
            <Button variant="outline" className="w-full">
              <Share className="h-4 w-4 mr-2" />
              Share Link
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExportTools;