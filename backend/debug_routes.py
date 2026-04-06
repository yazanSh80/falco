#!/usr/bin/env python
"""
Debug Flask Routes
List all registered routes in the Flask app
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def list_routes():
    """List all registered Flask routes."""
    app = create_app()
    app.config['TESTING'] = True
    
    print("[DEBUG] Flask Routes")
    print("=" * 80)
    
    # Get all routes
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'rule': rule.rule,
            'endpoint': rule.endpoint,
            'methods': ','.join(rule.methods - {'HEAD', 'OPTIONS'})
        })
    
    # Sort by rule
    routes.sort(key=lambda x: x['rule'])
    
    # Print routes
    print(f"{'Rule':<50} {'Endpoint':<30} {'Methods':<15}")
    print("-" * 95)
    
    auth_routes = [r for r in routes if 'auth' in r['rule'].lower()]
    print("\n[AUTH ROUTES]")
    for route in auth_routes:
        print(f"{route['rule']:<50} {route['endpoint']:<30} {route['methods']:<15}")
    
    print(f"\n[TOTAL ROUTES: {len(routes)}]")
    
    # Look specifically for login
    login_routes = [r for r in routes if 'login' in r['rule'].lower()]
    print(f"\n[LOGIN ROUTES]")
    if login_routes:
        for route in login_routes:
            print(f"{route['rule']:<50} {route['endpoint']:<30} {route['methods']:<15}")
    else:
        print("No login routes found!")
    
    # Print all routes
    print(f"\n[ALL {len(routes)} ROUTES]")
    for route in routes:
        if route['endpoint'] not in ['static']:
            print(f"{route['rule']:<50} {route['endpoint']:<30} {route['methods']:<15}")


if __name__ == '__main__':
    list_routes()
