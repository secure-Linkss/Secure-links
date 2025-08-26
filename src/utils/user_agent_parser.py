import re

def parse_user_agent(user_agent):
    """Parse user agent string to extract device and browser information"""
    if not user_agent:
        return {
            'device_type': 'Unknown',
            'browser': 'Unknown',
            'browser_version': 'Unknown',
            'os': 'Unknown',
            'os_version': 'Unknown'
        }
    
    ua = user_agent.lower()
    
    # Device type detection
    device_type = 'Desktop'
    if 'mobile' in ua or 'android' in ua or 'iphone' in ua or 'ipod' in ua:
        device_type = 'Mobile'
    elif 'tablet' in ua or 'ipad' in ua:
        device_type = 'Tablet'
    
    # Browser detection
    browser = 'Unknown'
    browser_version = 'Unknown'
    
    if 'chrome' in ua and 'chromium' not in ua:
        browser = 'Chrome'
        match = re.search(r'chrome/(\d+\.\d+)', ua)
        if match:
            browser_version = match.group(1)
    elif 'firefox' in ua:
        browser = 'Firefox'
        match = re.search(r'firefox/(\d+\.\d+)', ua)
        if match:
            browser_version = match.group(1)
    elif 'safari' in ua and 'chrome' not in ua:
        browser = 'Safari'
        match = re.search(r'version/(\d+\.\d+)', ua)
        if match:
            browser_version = match.group(1)
    elif 'edge' in ua:
        browser = 'Edge'
        match = re.search(r'edge/(\d+\.\d+)', ua)
        if match:
            browser_version = match.group(1)
    elif 'opera' in ua or 'opr' in ua:
        browser = 'Opera'
        match = re.search(r'(?:opera|opr)/(\d+\.\d+)', ua)
        if match:
            browser_version = match.group(1)
    
    # Operating system detection
    os = 'Unknown'
    os_version = 'Unknown'
    
    if 'windows nt' in ua:
        os = 'Windows'
        if 'windows nt 10.0' in ua:
            os_version = '10'
        elif 'windows nt 6.3' in ua:
            os_version = '8.1'
        elif 'windows nt 6.2' in ua:
            os_version = '8'
        elif 'windows nt 6.1' in ua:
            os_version = '7'
    elif 'mac os x' in ua:
        os = 'macOS'
        match = re.search(r'mac os x (\d+[._]\d+)', ua)
        if match:
            os_version = match.group(1).replace('_', '.')
    elif 'android' in ua:
        os = 'Android'
        match = re.search(r'android (\d+\.\d+)', ua)
        if match:
            os_version = match.group(1)
    elif 'iphone os' in ua or 'ios' in ua:
        os = 'iOS'
        match = re.search(r'(?:iphone )?os (\d+[._]\d+)', ua)
        if match:
            os_version = match.group(1).replace('_', '.')
    elif 'linux' in ua:
        os = 'Linux'
    
    return {
        'device_type': device_type,
        'browser': browser,
        'browser_version': browser_version,
        'os': os,
        'os_version': os_version
    }

def generate_unique_id():
    """Generate a unique ID for tracking"""
    import random
    import string
    return ''.join(random.choices(string.ascii_letters + string.digits, k=8))

