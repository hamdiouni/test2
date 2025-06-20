import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  Zap, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  Target,
  BarChart3,
  PieChart,
  Lightbulb,
  Award,
  Globe,
  Battery,
  Wind,
  Sun
} from 'lucide-react';
import Chart from 'react-apexcharts';

interface GreenPathOptimizationProps {
  telemetryData: any[];
  predictions: any[];
}

const GreenPathOptimization: React.FC<GreenPathOptimizationProps> = ({ 
  telemetryData, 
  predictions 
}) => {
  const [selectedMetric, setSelectedMetric] = useState('energy');
  const [optimizationTarget, setOptimizationTarget] = useState('carbon');

  // Calculate green metrics
  const greenMetrics = {
    avgEnergyEfficiency: telemetryData.length > 0 
      ? telemetryData.reduce((sum, d) => sum + (d.energy_efficiency || 85), 0) / telemetryData.length
      : 85,
    totalCarbonFootprint: telemetryData.reduce((sum, d) => sum + (d.carbon_footprint || 25), 0),
    energySavings: 15.7, // Percentage saved through optimization
    greenNodes: telemetryData.filter(d => (d.energy_efficiency || 85) > 90).length,
    carbonReduction: 23.4, // Percentage reduction in carbon emissions
    renewableEnergy: 67.8 // Percentage of renewable energy usage
  };

  // Energy efficiency chart data
  const energyEfficiencyData = {
    series: [{
      name: 'Energy Efficiency',
      data: telemetryData.slice(-15).map((d, i) => ({
        x: i,
        y: (d.energy_efficiency || 85 + Math.random() * 10).toFixed(1)
      }))
    }],
    options: {
      chart: {
        type: 'area',
        height: 350,
        toolbar: { show: false },
        background: 'transparent'
      },
      theme: {
        mode: 'dark'
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100]
        }
      },
      colors: ['#10b981'],
      xaxis: {
        title: { text: 'Time' },
        labels: { style: { colors: '#9ca3af' } }
      },
      yaxis: {
        title: { text: 'Efficiency (%)' },
        labels: { style: { colors: '#9ca3af' } },
        min: 70,
        max: 100
      },
      grid: {
        borderColor: '#374151'
      },
      tooltip: {
        theme: 'dark'
      }
    }
  };

  // Carbon footprint comparison
  const carbonFootprintData = {
    series: [
      {
        name: 'Before Optimization',
        data: [45, 52, 38, 47, 49, 43, 51, 46]
      },
      {
        name: 'After Optimization',
        data: [32, 38, 27, 34, 35, 31, 37, 33]
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
      colors: ['#ef4444', '#10b981'],
      xaxis: {
        categories: ['Node 1', 'Node 2', 'Node 3', 'Node 4', 'Node 5', 'Node 6', 'Node 7', 'Node 8'],
        labels: { style: { colors: '#9ca3af' } }
      },
      yaxis: {
        title: { text: 'CO2 Emissions (kg/day)' },
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

  // Energy source distribution
  const energySourceData = {
    series: [67.8, 18.5, 8.2, 5.5],
    options: {
      chart: {
        type: 'donut',
        height: 350,
        background: 'transparent'
      },
      theme: {
        mode: 'dark'
      },
      labels: ['Renewable', 'Natural Gas', 'Coal', 'Nuclear'],
      colors: ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'],
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
                label: 'Renewable',
                formatter: () => '67.8%'
              }
            }
          }
        }
      }
    }
  };

  // Green path recommendations
  const recommendations = [
    {
      title: 'Route Optimization',
      description: 'Switch to energy-efficient paths during peak hours',
      impact: 'High',
      savings: '12% energy reduction',
      icon: Target,
      color: 'green'
    },
    {
      title: 'Load Balancing',
      description: 'Distribute traffic to nodes with higher renewable energy',
      impact: 'Medium',
      savings: '8% carbon reduction',
      icon: Activity,
      color: 'blue'
    },
    {
      title: 'Sleep Mode Scheduling',
      description: 'Enable sleep mode for underutilized nodes during off-peak',
      impact: 'High',
      savings: '15% energy savings',
      icon: Battery,
      color: 'purple'
    },
    {
      title: 'Renewable Integration',
      description: 'Increase renewable energy usage to 80%',
      impact: 'Very High',
      savings: '25% carbon reduction',
      icon: Sun,
      color: 'yellow'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-40">
              <BarChart3 className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="energy">Energy Efficiency</SelectItem>
              <SelectItem value="carbon">Carbon Footprint</SelectItem>
              <SelectItem value="renewable">Renewable Usage</SelectItem>
            </SelectContent>
          </Select>

          <Select value={optimizationTarget} onValueChange={setOptimizationTarget}>
            <SelectTrigger className="w-40">
              <Target className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="carbon">Minimize Carbon</SelectItem>
              <SelectItem value="energy">Maximize Efficiency</SelectItem>
              <SelectItem value="cost">Reduce Costs</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="bg-green-600 hover:bg-green-700">
          <Lightbulb className="h-4 w-4 mr-2" />
          Optimize Paths
        </Button>
      </div>

      {/* Green Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Efficiency</CardTitle>
              <Zap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {greenMetrics.avgEnergyEfficiency.toFixed(1)}%
              </div>
              <Progress value={greenMetrics.avgEnergyEfficiency} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Network average</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbon Reduction</CardTitle>
              <Leaf className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {greenMetrics.carbonReduction.toFixed(1)}%
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingDown className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renewable Energy</CardTitle>
              <Sun className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {greenMetrics.renewableEnergy.toFixed(1)}%
              </div>
              <Progress value={greenMetrics.renewableEnergy} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">Of total usage</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Energy Savings</CardTitle>
              <Battery className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {greenMetrics.energySavings.toFixed(1)}%
              </div>
              <div className="flex items-center space-x-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">This quarter</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <Tabs defaultValue="efficiency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="efficiency">Energy Efficiency</TabsTrigger>
          <TabsTrigger value="carbon">Carbon Footprint</TabsTrigger>
          <TabsTrigger value="sources">Energy Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="efficiency">
          <Card>
            <CardHeader>
              <CardTitle>Energy Efficiency Trends</CardTitle>
              <CardDescription>
                Real-time energy efficiency across network infrastructure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                options={energyEfficiencyData.options}
                series={energyEfficiencyData.series}
                type="area"
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="carbon">
          <Card>
            <CardHeader>
              <CardTitle>Carbon Footprint Optimization</CardTitle>
              <CardDescription>
                Before and after optimization comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                options={carbonFootprintData.options}
                series={carbonFootprintData.series}
                type="bar"
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Energy Source Distribution</CardTitle>
              <CardDescription>
                Breakdown of energy sources powering the network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Chart
                options={energySourceData.options}
                series={energySourceData.series}
                type="donut"
                height={350}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Green Path Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            <span>Optimization Recommendations</span>
          </CardTitle>
          <CardDescription>
            AI-powered suggestions to improve energy efficiency and reduce carbon footprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => {
              const IconComponent = rec.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      rec.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                      rec.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                      rec.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                      'bg-yellow-100 dark:bg-yellow-900'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        rec.color === 'green' ? 'text-green-600' :
                        rec.color === 'blue' ? 'text-blue-600' :
                        rec.color === 'purple' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant={
                          rec.impact === 'Very High' ? 'default' :
                          rec.impact === 'High' ? 'secondary' : 'outline'
                        }>
                          {rec.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">
                          {rec.savings}
                        </span>
                        <Button size="sm" variant="outline">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Green Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span>Green Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Leaf className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Carbon Neutral Network
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Achieved 50% carbon reduction milestone
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200">
                    Energy Efficiency Leader
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Top 10% in industry energy efficiency
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Sun className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                    Renewable Pioneer
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    65%+ renewable energy usage
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span>Environmental Impact</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  2.4 tons
                </div>
                <p className="text-sm text-muted-foreground">
                  CO2 saved this month
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-blue-600">156</div>
                  <p className="text-xs text-muted-foreground">Trees equivalent</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-purple-600">89%</div>
                  <p className="text-xs text-muted-foreground">Efficiency score</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Your network optimization efforts have prevented the equivalent of 
                  <span className="font-medium text-green-600"> 1,247 miles </span>
                  of car emissions this quarter.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GreenPathOptimization;