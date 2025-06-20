"""
Enhanced Alert Service for Email and Telegram notifications
"""
import smtplib
import requests
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
import os
from datetime import datetime
import asyncio
import aiohttp

logger = logging.getLogger(__name__)

class AlertService:
    """Enhanced alert service with multiple notification channels"""
    
    def __init__(self):
        # Email configuration
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        
        # Telegram configuration
        self.telegram_bot_token = os.getenv("TELEGRAM_BOT_TOKEN", "")
        self.telegram_api_url = f"https://api.telegram.org/bot{self.telegram_bot_token}"
        
        # Alert templates
        self.email_templates = {
            "sla_violation": self._get_sla_email_template(),
            "anomaly": self._get_anomaly_email_template(),
            "system": self._get_system_email_template()
        }
        
        self.telegram_templates = {
            "sla_violation": self._get_sla_telegram_template(),
            "anomaly": self._get_anomaly_telegram_template(),
            "system": self._get_system_telegram_template()
        }
    
    async def send_email_alert(
        self, 
        to_email: str, 
        alert_type: str, 
        data: Dict[str, Any]
    ) -> bool:
        """Send email alert with enhanced formatting"""
        try:
            if not self.smtp_username or not self.smtp_password:
                logger.warning("SMTP credentials not configured")
                return False
            
            # Get template and format message
            template = self.email_templates.get(alert_type, self.email_templates["system"])
            subject, html_body = template(data)
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add HTML content
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Email alert sent to {to_email} (type: {alert_type})")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email alert: {e}")
            return False
    
    async def send_telegram_alert(
        self, 
        chat_id: str, 
        alert_type: str, 
        data: Dict[str, Any]
    ) -> bool:
        """Send Telegram alert with enhanced formatting"""
        try:
            if not self.telegram_bot_token:
                logger.warning("Telegram bot token not configured")
                return False
            
            # Get template and format message
            template = self.telegram_templates.get(alert_type, self.telegram_templates["system"])
            message = template(data)
            
            # Send message
            async with aiohttp.ClientSession() as session:
                url = f"{self.telegram_api_url}/sendMessage"
                payload = {
                    "chat_id": chat_id,
                    "text": message,
                    "parse_mode": "HTML",
                    "disable_web_page_preview": True
                }
                
                async with session.post(url, json=payload) as response:
                    if response.status == 200:
                        logger.info(f"Telegram alert sent to {chat_id} (type: {alert_type})")
                        return True
                    else:
                        logger.error(f"Telegram API error: {response.status}")
                        return False
                        
        except Exception as e:
            logger.error(f"Failed to send Telegram alert: {e}")
            return False
    
    async def send_multi_channel_alert(
        self,
        alert_type: str,
        data: Dict[str, Any],
        email: Optional[str] = None,
        telegram_chat_id: Optional[str] = None
    ) -> Dict[str, bool]:
        """Send alert through multiple channels"""
        results = {}
        
        # Send email if configured
        if email:
            results['email'] = await self.send_email_alert(email, alert_type, data)
        
        # Send Telegram if configured
        if telegram_chat_id:
            results['telegram'] = await self.send_telegram_alert(telegram_chat_id, alert_type, data)
        
        return results
    
    def _get_sla_email_template(self):
        """SLA violation email template"""
        def template(data: Dict[str, Any]) -> tuple:
            subject = f"🚨 SLA Violation Alert - {data.get('source', 'Unknown')} → {data.get('target', 'Unknown')}"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ background-color: #dc2626; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .metric {{ background-color: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }}
                    .footer {{ background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
                    .risk-high {{ color: #dc2626; font-weight: bold; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚨 SLA Violation Alert</h1>
                    </div>
                    <div class="content">
                        <h2>High Risk Detected</h2>
                        <p>A high SLA violation risk has been detected on your network connection.</p>
                        
                        <div class="metric">
                            <strong>Connection:</strong> {data.get('source', 'Unknown')} → {data.get('target', 'Unknown')}
                        </div>
                        <div class="metric">
                            <strong>Risk Score:</strong> <span class="risk-high">{data.get('risk_score', 0) * 100:.1f}%</span>
                        </div>
                        <div class="metric">
                            <strong>Timestamp:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
                        </div>
                        
                        <h3>Network Metrics:</h3>
                        <div class="metric">Latency: {data.get('latency', 'N/A')}ms</div>
                        <div class="metric">Packet Loss: {data.get('packet_loss', 'N/A')}%</div>
                        <div class="metric">Jitter: {data.get('jitter', 'N/A')}ms</div>
                        <div class="metric">Congestion: {data.get('congestion', 'N/A')}%</div>
                        
                        <p><strong>Recommended Action:</strong> Immediate investigation and remediation required.</p>
                    </div>
                    <div class="footer">
                        SLA Prediction Platform v2.1.0 | Automated Alert System
                    </div>
                </div>
            </body>
            </html>
            """
            
            return subject, html_body
        
        return template
    
    def _get_anomaly_email_template(self):
        """Anomaly detection email template"""
        def template(data: Dict[str, Any]) -> tuple:
            subject = f"⚠️ Network Anomaly Detected - {data.get('source', 'Unknown')} → {data.get('target', 'Unknown')}"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ background-color: #f59e0b; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .metric {{ background-color: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; }}
                    .footer {{ background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Network Anomaly Alert</h1>
                    </div>
                    <div class="content">
                        <h2>Anomalous Behavior Detected</h2>
                        <p>Unusual network behavior has been detected that deviates from normal patterns.</p>
                        
                        <div class="metric">
                            <strong>Connection:</strong> {data.get('source', 'Unknown')} → {data.get('target', 'Unknown')}
                        </div>
                        <div class="metric">
                            <strong>Anomaly Score:</strong> {data.get('anomaly_score', 0) * 100:.1f}%
                        </div>
                        <div class="metric">
                            <strong>Explanation:</strong> {data.get('explanation', 'Unusual pattern detected')}
                        </div>
                        <div class="metric">
                            <strong>Timestamp:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
                        </div>
                        
                        <p><strong>Recommended Action:</strong> Monitor closely and investigate if pattern persists.</p>
                    </div>
                    <div class="footer">
                        SLA Prediction Platform v2.1.0 | Automated Alert System
                    </div>
                </div>
            </body>
            </html>
            """
            
            return subject, html_body
        
        return template
    
    def _get_system_email_template(self):
        """System alert email template"""
        def template(data: Dict[str, Any]) -> tuple:
            subject = f"🔔 System Alert - {data.get('type', 'Unknown')}"
            
            html_body = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
                    .header {{ background-color: #3b82f6; color: white; padding: 20px; text-align: center; }}
                    .content {{ padding: 20px; }}
                    .footer {{ background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 System Alert</h1>
                    </div>
                    <div class="content">
                        <h2>{data.get('title', 'System Notification')}</h2>
                        <p>{data.get('message', 'A system event has occurred.')}</p>
                        <p><strong>Timestamp:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                    </div>
                    <div class="footer">
                        SLA Prediction Platform v2.1.0 | Automated Alert System
                    </div>
                </div>
            </body>
            </html>
            """
            
            return subject, html_body
        
        return template
    
    def _get_sla_telegram_template(self):
        """SLA violation Telegram template"""
        def template(data: Dict[str, Any]) -> str:
            return f"""
🚨 <b>SLA Violation Alert</b>

<b>Connection:</b> {data.get('source', 'Unknown')} → {data.get('target', 'Unknown')}
<b>Risk Score:</b> {data.get('risk_score', 0) * 100:.1f}%
<b>Time:</b> {datetime.utcnow().strftime('%H:%M:%S UTC')}

<b>Metrics:</b>
• Latency: {data.get('latency', 'N/A')}ms
• Packet Loss: {data.get('packet_loss', 'N/A')}%
• Jitter: {data.get('jitter', 'N/A')}ms

⚡ <b>Action Required:</b> Immediate investigation needed
            """.strip()
        
        return template
    
    def _get_anomaly_telegram_template(self):
        """Anomaly detection Telegram template"""
        def template(data: Dict[str, Any]) -> str:
            return f"""
⚠️ <b>Network Anomaly Detected</b>

<b>Connection:</b> {data.get('source', 'Unknown')} → {data.get('target', 'Unknown')}
<b>Anomaly Score:</b> {data.get('anomaly_score', 0) * 100:.1f}%
<b>Explanation:</b> {data.get('explanation', 'Unusual pattern detected')}
<b>Time:</b> {datetime.utcnow().strftime('%H:%M:%S UTC')}

🔍 <b>Action:</b> Monitor closely and investigate if pattern persists
            """.strip()
        
        return template
    
    def _get_system_telegram_template(self):
        """System alert Telegram template"""
        def template(data: Dict[str, Any]) -> str:
            return f"""
🔔 <b>System Alert</b>

<b>Type:</b> {data.get('type', 'Unknown')}
<b>Message:</b> {data.get('message', 'System event occurred')}
<b>Time:</b> {datetime.utcnow().strftime('%H:%M:%S UTC')}

📊 SLA Prediction Platform v2.1.0
            """.strip()
        
        return template