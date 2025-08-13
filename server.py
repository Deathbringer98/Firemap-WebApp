#!/usr/bin/env python3
"""
Simple Python server to handle JSON file operations for Fire Map reports
Replaces PHP functionality for cross-platform compatibility
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import time
from datetime import datetime, timedelta

class FireMapHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api.php':
            self.handle_api_request()
        else:
            # Serve static files
            self.serve_static_file()
    
    def do_POST(self):
        if self.path == '/api.php':
            self.handle_api_request()
        else:
            self.send_error(404)
    
    def handle_api_request(self):
        """Handle API requests for reports"""
        try:
            # Parse query parameters
            parsed_url = urlparse(self.path)
            params = parse_qs(parsed_url.query)
            action = params.get('action', [''])[0]
            
            if self.command == 'GET' and action == 'get_reports':
                self.get_reports()
            elif self.command == 'POST' and action == 'add_report':
                self.add_report()
            else:
                self.send_error(400, "Invalid action")
        except Exception as e:
            self.send_error(500, f"Server error: {str(e)}")
    
    def get_reports(self):
        """Return all active reports from data.json"""
        try:
            if os.path.exists('data.json'):
                with open('data.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    reports = data.get('reports', [])
                    
                    # Filter out expired reports (older than 24 hours)
                    now = datetime.now()
                    active_reports = []
                    
                    for report in reports:
                        try:
                            report_time = datetime.fromisoformat(report['timestamp'].replace('Z', '+00:00'))
                            if now - report_time.replace(tzinfo=None) < timedelta(hours=24):
                                active_reports.append(report)
                        except:
                            # Skip reports with invalid timestamps
                            continue
                    
                    self.send_json_response({'success': True, 'reports': active_reports})
            else:
                self.send_json_response({'success': True, 'reports': []})
        except Exception as e:
            self.send_json_response({'success': False, 'error': str(e)})
    
    def add_report(self):
        """Add a new report to data.json"""
        try:
            # Read POST data
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                new_report = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_json_response({'success': False, 'error': 'Invalid JSON data'})
                return
            
            # Load existing data
            if os.path.exists('data.json'):
                with open('data.json', 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                data = {'reports': []}
            
            # Add timestamp if not present
            if 'timestamp' not in new_report:
                new_report['timestamp'] = datetime.now().isoformat() + 'Z'
            
            # Add the new report
            data['reports'].append(new_report)
            
            # Save back to file
            with open('data.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            
            self.send_json_response({'success': True, 'message': 'Report added successfully'})
            
        except Exception as e:
            self.send_json_response({'success': False, 'error': str(e)})
    
    def send_json_response(self, data):
        """Send JSON response with CORS headers"""
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def serve_static_file(self):
        """Serve static files (HTML, CSS, JS)"""
        if self.path == '/':
            filename = 'index.html'
        else:
            filename = self.path.lstrip('/')
        
        try:
            # Security check - prevent directory traversal
            if '..' in filename or filename.startswith('/'):
                self.send_error(403)
                return
            
            if os.path.exists(filename):
                # Determine content type
                if filename.endswith('.html'):
                    content_type = 'text/html'
                elif filename.endswith('.css'):
                    content_type = 'text/css'
                elif filename.endswith('.js'):
                    content_type = 'application/javascript'
                elif filename.endswith('.json'):
                    content_type = 'application/json'
                else:
                    content_type = 'text/plain'
                
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                with open(filename, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404)
        except Exception as e:
            self.send_error(500, f"Error serving file: {str(e)}")
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8080):
    """Start the server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, FireMapHandler)
    print(f"🔥 Fire Map server running on http://localhost:{port}")
    print(f"📁 Serving from: {os.getcwd()}")
    print(f"📊 API endpoint: http://localhost:{port}/api.php")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
        httpd.server_close()

if __name__ == '__main__':
    # Change to the script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create initial data.json if it doesn't exist
    if not os.path.exists('data.json'):
        with open('data.json', 'w') as f:
            json.dump({'reports': []}, f, indent=2)
        print("📝 Created initial data.json file")
    
    run_server()
