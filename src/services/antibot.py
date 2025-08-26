import re
import json
import logging
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from collections import defaultdict
import requests
from user_agents import parse
import geoip2.database
import geoip2.errors

logger = logging.getLogger(__name__)

class AdvancedAntiBotService:
    def __init__(self):
        self.rate_limits = defaultdict(list)
        self.blocked_ips = set()
        self.suspicious_patterns = []
        self.whitelist_ips = set()
        self.bot_signatures = self._load_bot_signatures()
        self.threat_scores = defaultdict(int)
        self.session_tracking = defaultdict(dict)
        
        # Advanced detection patterns
        self.bot_user_agents = [
            r'bot', r'crawler', r'spider', r'scraper', r'curl', r'wget',
            r'python-requests', r'scrapy', r'selenium', r'phantomjs',
            r'headless', r'automated', r'test', r'monitor', r'check',
            r'scan', r'audit', r'validator', r'archiver', r'harvester'
        ]
        
        # Suspicious behavior patterns
        self.suspicious_behaviors = {
            'rapid_requests': 10,  # requests per minute
            'no_referrer': True,
            'suspicious_headers': True,
            'automation_tools': True,
            'datacenter_ip': True,
            'tor_exit_node': True,
            'vpn_detected': True
        }
        
        # Known datacenter IP ranges (simplified)
        self.datacenter_ranges = [
            '173.252.66.0/24',  # Facebook
            '199.16.156.0/22',  # Twitter
            '54.0.0.0/8',       # AWS
            '173.194.0.0/16',   # Google
            '157.55.0.0/16',    # Microsoft
            '40.0.0.0/8',       # Azure
        ]
    
    def _load_bot_signatures(self) -> Dict:
        """Load known bot signatures and patterns"""
        return {
            'search_engines': [
                'googlebot', 'bingbot', 'slurp', 'duckduckbot',
                'baiduspider', 'yandexbot', 'facebookexternalhit',
                'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot'
            ],
            'scrapers': [
                'ahrefsbot', 'mj12bot', 'dotbot', 'semrushbot',
                'majesticsseo', 'blexbot', 'ccbot', 'gptbot',
                'claude-web', 'anthropic-ai', 'perplexitybot'
            ],
            'tools': [
                'wget', 'curl', 'python-requests', 'scrapy',
                'selenium', 'phantomjs', 'headless', 'postman',
                'insomnia', 'httpie', 'node-fetch'
            ]
        }
    
    def analyze_request(self, request_data: Dict) -> Dict:
        """Comprehensive request analysis"""
        ip_address = request_data.get('ip_address', '')
        user_agent = request_data.get('user_agent', '')
        headers = request_data.get('headers', {})
        referrer = request_data.get('referrer', '')
        timestamp = request_data.get('timestamp', time.time())
        
        analysis = {
            'ip_address': ip_address,
            'timestamp': timestamp,
            'is_bot': False,
            'bot_type': None,
            'threat_score': 0,
            'blocked_reason': None,
            'suspicious_indicators': [],
            'geolocation': {},
            'device_info': {},
            'behavior_analysis': {}
        }
        
        # IP-based analysis
        ip_analysis = self._analyze_ip(ip_address)
        analysis.update(ip_analysis)
        
        # User agent analysis
        ua_analysis = self._analyze_user_agent(user_agent)
        analysis.update(ua_analysis)
        
        # Header analysis
        header_analysis = self._analyze_headers(headers)
        analysis.update(header_analysis)
        
        # Behavioral analysis
        behavior_analysis = self._analyze_behavior(ip_address, timestamp)
        analysis['behavior_analysis'] = behavior_analysis
        
        # Calculate final threat score
        analysis['threat_score'] = self._calculate_threat_score(analysis)
        
        # Determine if request should be blocked
        if analysis['threat_score'] > 70:
            analysis['is_bot'] = True
            analysis['blocked_reason'] = self._determine_block_reason(analysis)
        
        # Update tracking
        self._update_tracking(ip_address, analysis)
        
        return analysis
    
    def _analyze_ip(self, ip_address: str) -> Dict:
        """Analyze IP address for threats"""
        analysis = {
            'geolocation': {},
            'ip_reputation': 'unknown',
            'is_datacenter': False,
            'is_tor': False,
            'is_vpn': False
        }
        
        try:
            # Geolocation analysis (would need GeoIP database)
            # This is a simplified version
            analysis['geolocation'] = {
                'country': 'Unknown',
                'city': 'Unknown',
                'region': 'Unknown',
                'isp': 'Unknown',
                'organization': 'Unknown'
            }
            
            # Check if IP is in datacenter ranges
            analysis['is_datacenter'] = self._is_datacenter_ip(ip_address)
            
            # Check IP reputation (would integrate with threat intelligence)
            analysis['ip_reputation'] = self._check_ip_reputation(ip_address)
            
        except Exception as e:
            logger.error(f"Error analyzing IP {ip_address}: {e}")
        
        return analysis
    
    def _analyze_user_agent(self, user_agent: str) -> Dict:
        """Analyze user agent string"""
        analysis = {
            'device_info': {},
            'is_bot_ua': False,
            'bot_type': None,
            'automation_detected': False
        }
        
        if not user_agent:
            analysis['suspicious_indicators'] = ['missing_user_agent']
            return analysis
        
        ua_lower = user_agent.lower()
        
        # Check for bot patterns
        for pattern in self.bot_user_agents:
            if re.search(pattern, ua_lower):
                analysis['is_bot_ua'] = True
                analysis['automation_detected'] = True
                break
        
        # Categorize bot type
        for bot_type, signatures in self.bot_signatures.items():
            for signature in signatures:
                if signature in ua_lower:
                    analysis['bot_type'] = bot_type
                    break
        
        # Parse user agent for device info
        try:
            parsed_ua = parse(user_agent)
            analysis['device_info'] = {
                'browser': parsed_ua.browser.family,
                'browser_version': parsed_ua.browser.version_string,
                'os': parsed_ua.os.family,
                'os_version': parsed_ua.os.version_string,
                'device': parsed_ua.device.family,
                'is_mobile': parsed_ua.is_mobile,
                'is_tablet': parsed_ua.is_tablet,
                'is_pc': parsed_ua.is_pc,
                'is_bot': parsed_ua.is_bot
            }
            
            if parsed_ua.is_bot:
                analysis['is_bot_ua'] = True
                
        except Exception as e:
            logger.error(f"Error parsing user agent: {e}")
        
        return analysis
    
    def _analyze_headers(self, headers: Dict) -> Dict:
        """Analyze HTTP headers for suspicious patterns"""
        analysis = {
            'suspicious_headers': [],
            'missing_headers': [],
            'header_anomalies': []
        }
        
        # Expected headers for legitimate browsers
        expected_headers = [
            'accept', 'accept-language', 'accept-encoding',
            'connection', 'upgrade-insecure-requests'
        ]
        
        # Check for missing headers
        for header in expected_headers:
            if header not in [h.lower() for h in headers.keys()]:
                analysis['missing_headers'].append(header)
        
        # Check for suspicious header values
        for header, value in headers.items():
            header_lower = header.lower()
            value_lower = str(value).lower()
            
            # Suspicious accept headers
            if header_lower == 'accept' and '*/*' == value_lower:
                analysis['suspicious_headers'].append('generic_accept')
            
            # Suspicious user agents in headers
            if 'bot' in value_lower or 'crawler' in value_lower:
                analysis['suspicious_headers'].append('bot_in_headers')
            
            # Automation tool signatures
            automation_signatures = ['selenium', 'phantomjs', 'headless', 'automated']
            for sig in automation_signatures:
                if sig in value_lower:
                    analysis['suspicious_headers'].append(f'automation_{sig}')
        
        return analysis
    
    def _analyze_behavior(self, ip_address: str, timestamp: float) -> Dict:
        """Analyze behavioral patterns"""
        analysis = {
            'request_frequency': 0,
            'session_duration': 0,
            'page_views': 0,
            'rapid_requests': False,
            'suspicious_timing': False
        }
        
        # Track request frequency
        current_time = timestamp
        minute_ago = current_time - 60
        
        # Clean old entries
        self.rate_limits[ip_address] = [
            t for t in self.rate_limits[ip_address] if t > minute_ago
        ]
        
        # Add current request
        self.rate_limits[ip_address].append(current_time)
        
        analysis['request_frequency'] = len(self.rate_limits[ip_address])
        
        # Check for rapid requests
        if analysis['request_frequency'] > self.suspicious_behaviors['rapid_requests']:
            analysis['rapid_requests'] = True
        
        # Session tracking
        if ip_address in self.session_tracking:
            session = self.session_tracking[ip_address]
            analysis['session_duration'] = current_time - session.get('start_time', current_time)
            analysis['page_views'] = session.get('page_views', 0) + 1
            session['page_views'] = analysis['page_views']
            session['last_seen'] = current_time
        else:
            self.session_tracking[ip_address] = {
                'start_time': current_time,
                'last_seen': current_time,
                'page_views': 1
            }
            analysis['page_views'] = 1
        
        return analysis
    
    def _calculate_threat_score(self, analysis: Dict) -> int:
        """Calculate overall threat score (0-100)"""
        score = 0
        
        # Bot detection
        if analysis.get('is_bot_ua', False):
            score += 30
        
        if analysis.get('automation_detected', False):
            score += 25
        
        # Behavioral scoring
        behavior = analysis.get('behavior_analysis', {})
        if behavior.get('rapid_requests', False):
            score += 20
        
        if behavior.get('request_frequency', 0) > 20:
            score += 15
        
        # Header anomalies
        if analysis.get('missing_headers', []):
            score += len(analysis['missing_headers']) * 3
        
        if analysis.get('suspicious_headers', []):
            score += len(analysis['suspicious_headers']) * 5
        
        # IP-based scoring
        if analysis.get('is_datacenter', False):
            score += 15
        
        if analysis.get('is_tor', False):
            score += 20
        
        if analysis.get('is_vpn', False):
            score += 10
        
        # Known bot types
        bot_type = analysis.get('bot_type')
        if bot_type == 'scrapers':
            score += 40
        elif bot_type == 'tools':
            score += 35
        elif bot_type == 'search_engines':
            score += 5  # Lower score for legitimate search engines
        
        return min(score, 100)
    
    def _determine_block_reason(self, analysis: Dict) -> str:
        """Determine the primary reason for blocking"""
        if analysis.get('is_bot_ua', False):
            return 'Bot user agent detected'
        
        if analysis.get('automation_detected', False):
            return 'Automation tools detected'
        
        behavior = analysis.get('behavior_analysis', {})
        if behavior.get('rapid_requests', False):
            return 'Rapid request pattern detected'
        
        if analysis.get('is_datacenter', False):
            return 'Datacenter IP detected'
        
        if analysis.get('suspicious_headers', []):
            return 'Suspicious HTTP headers'
        
        return 'High threat score'
    
    def _is_datacenter_ip(self, ip_address: str) -> bool:
        """Check if IP belongs to a datacenter"""
        # Simplified implementation
        # In production, use proper IP range checking
        datacenter_patterns = [
            '54.', '52.', '18.', '3.',  # AWS
            '40.', '52.', '13.',        # Azure
            '35.', '34.', '104.',       # Google Cloud
        ]
        
        for pattern in datacenter_patterns:
            if ip_address.startswith(pattern):
                return True
        
        return False
    
    def _check_ip_reputation(self, ip_address: str) -> str:
        """Check IP reputation against threat intelligence"""
        # Simplified implementation
        # In production, integrate with threat intelligence APIs
        
        # Check against known bad IPs (would be from database)
        if ip_address in self.blocked_ips:
            return 'malicious'
        
        # Check against whitelist
        if ip_address in self.whitelist_ips:
            return 'trusted'
        
        return 'unknown'
    
    def _update_tracking(self, ip_address: str, analysis: Dict):
        """Update tracking information"""
        # Update threat scores
        self.threat_scores[ip_address] = analysis['threat_score']
        
        # Add to blocked IPs if high threat score
        if analysis['threat_score'] > 80:
            self.blocked_ips.add(ip_address)
    
    def is_blocked(self, ip_address: str) -> bool:
        """Check if IP is blocked"""
        return ip_address in self.blocked_ips
    
    def add_to_whitelist(self, ip_address: str):
        """Add IP to whitelist"""
        self.whitelist_ips.add(ip_address)
        if ip_address in self.blocked_ips:
            self.blocked_ips.remove(ip_address)
    
    def add_to_blacklist(self, ip_address: str):
        """Add IP to blacklist"""
        self.blocked_ips.add(ip_address)
    
    def get_statistics(self) -> Dict:
        """Get antibot statistics"""
        return {
            'total_blocked_ips': len(self.blocked_ips),
            'total_whitelisted_ips': len(self.whitelist_ips),
            'active_sessions': len(self.session_tracking),
            'rate_limited_ips': len(self.rate_limits),
            'average_threat_score': sum(self.threat_scores.values()) / len(self.threat_scores) if self.threat_scores else 0
        }
    
    def cleanup_old_data(self, max_age_hours: int = 24):
        """Clean up old tracking data"""
        cutoff_time = time.time() - (max_age_hours * 3600)
        
        # Clean session tracking
        expired_sessions = []
        for ip, session in self.session_tracking.items():
            if session.get('last_seen', 0) < cutoff_time:
                expired_sessions.append(ip)
        
        for ip in expired_sessions:
            del self.session_tracking[ip]
        
        # Clean rate limits
        for ip in list(self.rate_limits.keys()):
            self.rate_limits[ip] = [
                t for t in self.rate_limits[ip] if t > cutoff_time
            ]
            if not self.rate_limits[ip]:
                del self.rate_limits[ip]

# Global instance
antibot_service = AdvancedAntiBotService()

def analyze_request(request_data: Dict) -> Dict:
    """Analyze incoming request for bot detection"""
    return antibot_service.analyze_request(request_data)

def is_blocked(ip_address: str) -> bool:
    """Check if IP is blocked"""
    return antibot_service.is_blocked(ip_address)

def get_antibot_stats() -> Dict:
    """Get antibot statistics"""
    return antibot_service.get_statistics()

