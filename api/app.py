import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.main import app

# This is the WSGI application that Vercel will call
def handler(event, context):
    return app

# For local development
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)

