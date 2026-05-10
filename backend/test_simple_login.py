#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Simple login test for debugging"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

app = create_app()
app.config['TESTING'] = True
client = app.test_client()

# Show registered routes
print("Login routes registered:")
for rule in app.url_map.iter_rules():
    if 'login' in rule.rule.lower():
        print("  {} - Methods: {}".format(rule.rule, rule.methods))

# Try to make a POST request
print("\nTesting POST to /api/auth/login...")
response = client.post('/api/auth/login',
    json={'email': 'admin@test.com', 'password': 'Pass123!'},
    content_type='application/json'
)

print("Status: {}".format(response.status_code))
print("Content-Type: {}".format(response.content_type))
print("Response: {}".format(response.get_data(as_text=True)[:500]))

# Also try OPTIONS to see what methods are allowed
print("\nTesting OPTIONS to /api/auth/login...")
response = client.options('/api/auth/login')
print("Status: {}".format(response.status_code))
print("Allow header: {}".format(response.headers.get('Allow', 'Not set')))

# Try GET just to see if route exists
print("\nTesting GET to /api/auth/login...")
response = client.get('/api/auth/login')
print("Status: {}".format(response.status_code))

# Try with /api/v1/auth/login
print("\nTesting POST to /api/v1/auth/login...")
response = client.post('/api/v1/auth/login',
    json={'email': 'admin@test.com', 'password': 'Pass123!'},
    content_type='application/json'
)

print("Status: {}".format(response.status_code))
print("Content-Type: {}".format(response.content_type))
print("Response: {}".format(response.get_data(as_text=True)[:500]))
