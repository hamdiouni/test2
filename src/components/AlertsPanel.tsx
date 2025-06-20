import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Send,
  Smartphone,
  Globe
} from 'lucide-react';

interface AlertsPanelProps {
  alerts: any[];
  alertSettings: any;
  onSettingsChange: (settings: any) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ 
  alerts, 
  alertSettings, 
  onSettingsChange 
}) => {
  const handleTestAlert = async (type: 'email' | 'telegram') => {
    // Simulate sending test alert
    console.log(`Sending test ${type} alert...`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Email Alerts</span>
            </CardTitle>
            <CardDescription>
              Configure email notifications for high-risk predictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive SLA violation alerts via email
                </p>
              </div>
              <Switch
                checked={alertSettings.emailEnabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ ...alertSettings, emailEnabled: checked })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={alertSettings.email}
                onChange={(e) => 
                  onSettingsChange({ ...alertSettings, email: e.target.value })
                }
                placeholder="admin@company.com"
                disabled={!alertSettings.emailEnabled}
              />
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleTestAlert('email')}
              disabled={!alertSettings.emailEnabled}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Telegram Alerts</span>
            </CardTitle>
            <CardDescription>
              Configure Telegram bot notifications for instant alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Telegram Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive instant notifications via Telegram
                </p>
              </div>
              <Switch
                checked={alertSettings.telegramEnabled}
                onCheckedChange={(checked) => 
                  onSettingsChange({ ...alertSettings, telegramEnabled: checked })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram Chat ID</Label>
              <Input
                id="telegram"
                value={alertSettings.telegramChatId}
                onChange={(e) => 
                  onSettingsChange({ ...alertSettings, telegramChatId: e.target.value })
                }
                placeholder="@your_chat_id or chat_id"
                disabled={!alertSettings.telegramEnabled}
              />
              <p className="text-xs text-muted-foreground">
                Get your chat ID by messaging @userinfobot on Telegram
              </p>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleTestAlert('telegram')}
              disabled={!alertSettings.telegramEnabled}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Test Message
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Alert Threshold Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Alert Thresholds</span>
          </CardTitle>
          <CardDescription>
            Configure when alerts should be triggered based on risk levels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label className="text-base">SLA Violation Risk Threshold</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Alert when risk score exceeds {alertSettings.riskThreshold}%
              </p>
              <div className="space-y-2">
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={alertSettings.riskThreshold}
                  onChange={(e) => 
                    onSettingsChange({ ...alertSettings, riskThreshold: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>50%</span>
                  <span className="font-medium">{alertSettings.riskThreshold}%</span>
                  <span>95%</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-green-600 font-semibold">Low Risk</div>
                <div className="text-sm text-muted-foreground">0-40%</div>
                <div className="text-xs mt-1">No alerts</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-yellow-600 font-semibold">Medium Risk</div>
                <div className="text-sm text-muted-foreground">40-{alertSettings.riskThreshold}%</div>
                <div className="text-xs mt-1">Monitoring</div>
              </div>
              <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-950">
                <div className="text-red-600 font-semibold">High Risk</div>
                <div className="text-sm text-muted-foreground">{alertSettings.riskThreshold}%+</div>
                <div className="text-xs mt-1">Alert triggered</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Recent Alerts</span>
          </CardTitle>
          <CardDescription>
            Latest alerts and notifications sent to configured channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.length > 0 ? (
              alerts.slice(0, 10).map((alert, index) => {
                const SeverityIcon = getSeverityIcon(alert.severity);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${
                      alert.severity === 'high' ? 'bg-red-100 dark:bg-red-900' :
                      alert.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                      'bg-blue-100 dark:bg-blue-900'
                    }`}>
                      <SeverityIcon className={`h-4 w-4 ${
                        alert.severity === 'high' ? 'text-red-600' :
                        alert.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{alert.message}</h4>
                        <Badge variant={getSeverityColor(alert.severity)} className="text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.source} → {alert.target}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        <div className="flex items-center space-x-2">
                          {alertSettings.emailEnabled && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>Email</span>
                            </div>
                          )}
                          {alertSettings.telegramEnabled && (
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>Telegram</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No alerts generated yet</p>
                <p className="text-sm">Alerts will appear here when risk thresholds are exceeded</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.severity === 'high').length}
            </div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">Average alert delivery</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AlertsPanel;