import requests
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class TelegramService:
    def __init__(self, bot_token: str, chat_id: str):
        self.bot_token = bot_token
        self.chat_id = chat_id
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
    
    def send_message(self, message: str, parse_mode: str = "HTML") -> bool:
        """Send a message to Telegram"""
        try:
            url = f"{self.base_url}/sendMessage"
            payload = {
                "chat_id": self.chat_id,
                "text": message,
                "parse_mode": parse_mode
            }
            
            response = requests.post(url, json=payload, timeout=10)
            response.raise_for_status()
            
            return True
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False
    
    def test_connection(self) -> Dict[str, any]:
        """Test the Telegram bot connection"""
        try:
            # Test bot info
            url = f"{self.base_url}/getMe"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            bot_info = response.json()
            if not bot_info.get('ok'):
                return {"success": False, "error": "Invalid bot token"}
            
            # Send test message
            test_message = "🤖 <b>Brain Link Tracker</b>\n\nTest connection successful! ✅\nYour Telegram notifications are now configured."
            if self.send_message(test_message):
                return {
                    "success": True, 
                    "bot_info": bot_info['result'],
                    "message": "Test message sent successfully"
                }
            else:
                return {"success": False, "error": "Failed to send test message"}
                
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": f"Connection error: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": f"Unexpected error: {str(e)}"}

class TelegramNotifier:
    def __init__(self, db_session):
        self.db = db_session
    
    def format_campaign_summary(self, campaign_data: Dict) -> str:
        """Format campaign summary for Telegram"""
        message = f"""📊 <b>Campaign Summary Update</b>
        
<b>Campaign:</b> {campaign_data.get('name', 'Unknown')}
<b>Date:</b> {datetime.now().strftime('%Y-%m-%d')} | <b>Time:</b> {datetime.now().strftime('%H:%M UTC')}

<b>📈 Performance:</b>
• Total Clicks: {campaign_data.get('total_clicks', 0)} (+{campaign_data.get('click_growth', 0)}%)
• Unique Visitors: {campaign_data.get('unique_visitors', 0)}
• Emails Captured: {campaign_data.get('captured_emails', 0)}

<b>🌍 Top Country:</b> {campaign_data.get('top_country', 'Unknown')} {campaign_data.get('country_flag', '🌍')}
<b>🔗 Best Performing Link:</b> {campaign_data.get('best_link', 'N/A')}

<b>📊 Status Breakdown:</b>
✔️ Opened: {campaign_data.get('opened', 0)}
🔗 Redirected: {campaign_data.get('redirected', 0)}
🖥️ On Page: {campaign_data.get('on_page', 0)}
"""
        return message
    
    def format_tracking_links_update(self, links_data: List[Dict]) -> str:
        """Format tracking links update for Telegram"""
        message = "🔗 <b>Tracking Links Update:</b>\n\n"
        
        for i, link in enumerate(links_data[:5], 1):  # Limit to top 5
            message += f"{i}. {link.get('url', 'N/A')} → {link.get('clicks', 0)} clicks ({link.get('unique', 0)} unique)\n"
        
        return message
    
    def format_captured_leads(self, leads_data: List[Dict], timeframe: str = "Last 2 hrs") -> str:
        """Format captured leads for Telegram"""
        if not leads_data:
            return f"📩 <b>New Leads Captured ({timeframe}):</b>\n\nNo new leads captured."
        
        message = f"📩 <b>New Leads Captured ({timeframe}):</b>\n\n"
        
        for lead in leads_data[:10]:  # Limit to 10 leads
            country = lead.get('country', 'Unknown')
            browser = lead.get('browser', 'Unknown')
            device = lead.get('device', 'Unknown')
            message += f"• {lead.get('email', 'N/A')} ({country}, {browser}, {device})\n"
        
        return message
    
    def format_security_alert(self, alert_data: Dict) -> str:
        """Format security alert for Telegram"""
        message = f"""⚠️ <b>Security Alert:</b>

<b>Suspicious Activity Detected</b>
<b>IP:</b> {alert_data.get('ip', 'Unknown')} ({alert_data.get('country', 'Unknown')}, {alert_data.get('threat_type', 'Unknown')})
<b>Campaign:</b> {alert_data.get('campaign', 'Unknown')}
<b>Action:</b> {alert_data.get('action', 'Blocked')}
<b>Time:</b> {alert_data.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M UTC'))}
"""
        return message
    
    def format_live_activity(self, activity_data: List[Dict], timeframe: str = "Last 30 mins") -> str:
        """Format live activity for Telegram"""
        if not activity_data:
            return f"🟢 <b>Live Activity ({timeframe}):</b>\n\nNo recent activity."
        
        message = f"🟢 <b>Live Activity ({timeframe}):</b>\n\n"
        
        for activity in activity_data[:10]:  # Limit to 10 activities
            time = activity.get('time', 'Unknown')
            email = activity.get('email', 'Unknown')
            status = activity.get('status', 'Unknown')
            country = activity.get('country', 'Unknown')
            browser = activity.get('browser', 'Unknown')
            device = activity.get('device', 'Unknown')
            
            message += f"[{time}] {email} | {status} | {country} | {browser} | {device}\n"
        
        return message
    
    def send_notification(self, bot_token: str, chat_id: str, notification_type: str, data: Dict) -> bool:
        """Send notification based on type"""
        try:
            telegram = TelegramService(bot_token, chat_id)
            
            if notification_type == "campaign_summary":
                message = self.format_campaign_summary(data)
            elif notification_type == "tracking_links":
                message = self.format_tracking_links_update(data.get('links', []))
            elif notification_type == "captured_leads":
                message = self.format_captured_leads(data.get('leads', []), data.get('timeframe', 'Last 2 hrs'))
            elif notification_type == "security_alert":
                message = self.format_security_alert(data)
            elif notification_type == "live_activity":
                message = self.format_live_activity(data.get('activities', []), data.get('timeframe', 'Last 30 mins'))
            else:
                logger.error(f"Unknown notification type: {notification_type}")
                return False
            
            return telegram.send_message(message)
            
        except Exception as e:
            logger.error(f"Failed to send {notification_type} notification: {e}")
            return False

