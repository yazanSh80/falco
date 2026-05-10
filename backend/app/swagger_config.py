"""
Swagger/OpenAPI Configuration for FalcoElectrec API
"""

SWAGGER_TEMPLATE = {
    "swagger": "2.0",
    "info": {
        "title": "FalcoElectrec API",
        "description": """
## FalcoElectrec — Multi-role Electrical Services Platform

This API powers the FalcoElectrec platform connecting customers with electrical service engineers in Palestine.

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token>
```

### Roles
- **Customer**: Request services, track progress, review engineers
- **Engineer**: Accept jobs, manage portfolio, view earnings  
- **Admin**: Approve engineers, manage users, platform analytics

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | Pass123! |
| Engineer | engineer@test.com | Pass123! |
| Admin | admin@test.com | Pass123! |

### Commission Rules
- Transactions ≤ 700 NIS: **0% commission**
- Transactions > 700 NIS: **5% commission**
        """,
        "version": "1.0.0",
        "contact": {
            "name": "FalcoElectrec Team",
            "email": "support@falcoelectrec.ps"
        },
        "license": {
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT"
        }
    },
    "host": "localhost:5000",
    "basePath": "/api",
    "schemes": ["http", "https"],
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
        }
    },
    "tags": [
        {
            "name": "Auth",
            "description": "Authentication endpoints"
        },
        {
            "name": "Services",
            "description": "Service catalog browsing"
        },
        {
            "name": "Requests",
            "description": "Service request management"
        },
        {
            "name": "Reviews",
            "description": "Review and rating endpoints"
        },
        {
            "name": "Engineer",
            "description": "Engineer-specific endpoints"
        },
        {
            "name": "Admin",
            "description": "Admin management endpoints"
        },
        {
            "name": "Finance",
            "description": "Financial transactions"
        },
        {
            "name": "Notifications",
            "description": "User notifications"
        },
        {
            "name": "Blocks",
            "description": "User blocking"
        },
        {
            "name": "Uploads",
            "description": "File uploads"
        }
    ]
}

SWAGGER_CONFIG = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs"
}

# API endpoint documentation strings
AUTH_DOCS = {
    "register": """
    Register a new user
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - name
            - email
            - password
            - role
          properties:
            name:
              type: string
              example: "Ahmad Khalil"
            email:
              type: string
              example: "ahmad@example.com"
            password:
              type: string
              example: "SecurePass123!"
            role:
              type: string
              enum: [customer, engineer]
              example: "customer"
            phone:
              type: string
              example: "0599123456"
            city:
              type: string
              example: "Hebron"
            area:
              type: string
              example: "City Center"
            specialization:
              type: string
              description: "Required for engineers"
              example: "Electrical"
            years_exp:
              type: integer
              description: "Required for engineers"
              example: 5
    responses:
      201:
        description: Registration successful
        schema:
          type: object
          properties:
            message:
              type: string
            user:
              type: object
            access_token:
              type: string
              description: "Only for customers (engineers need approval)"
      400:
        description: Validation error
      409:
        description: Email already registered
    """,
    
    "login": """
    Login and get JWT token
    ---
    tags:
      - Auth
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: "customer@test.com"
            password:
              type: string
              example: "Pass123!"
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            access_token:
              type: string
            refresh_token:
              type: string
            user:
              type: object
      401:
        description: Invalid credentials
      403:
        description: Account blocked or pending
    """,
    
    "me": """
    Get current user info
    ---
    tags:
      - Auth
    security:
      - Bearer: []
    responses:
      200:
        description: Current user details
        schema:
          type: object
          properties:
            user:
              type: object
      401:
        description: Not authenticated
    """
}

SERVICES_DOCS = {
    "list_features": """
    Get all service features/categories
    ---
    tags:
      - Services
    parameters:
      - name: include_services
        in: query
        type: boolean
        default: false
        description: Include services in each feature
    responses:
      200:
        description: List of features
        schema:
          type: object
          properties:
            features:
              type: array
              items:
                type: object
    """,
    
    "list_services": """
    Get all services, optionally filtered by feature
    ---
    tags:
      - Services
    parameters:
      - name: feature_id
        in: query
        type: string
        description: Filter by feature ID
    responses:
      200:
        description: List of services
        schema:
          type: object
          properties:
            services:
              type: array
              items:
                type: object
    """,
    
    "get_price_list": """
    Get the complete price list
    ---
    tags:
      - Services
    responses:
      200:
        description: Price list grouped by feature
        schema:
          type: object
          properties:
            price_list:
              type: array
              items:
                type: object
    """
}

REQUESTS_DOCS = {
    "create": """
    Create a new service request
    ---
    tags:
      - Requests
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - type
            - description
            - location_text
          properties:
            type:
              type: string
              enum: [quick, late]
            service_id:
              type: string
              description: "Required for 'late' type requests"
            category:
              type: string
            description:
              type: string
              example: "Need electrical repair in kitchen"
            location_text:
              type: string
              example: "123 Main St, Hebron"
    responses:
      201:
        description: Request created
      400:
        description: Validation error
      401:
        description: Not authenticated
    """,
    
    "list": """
    Get user's requests (filtered by role)
    ---
    tags:
      - Requests
    security:
      - Bearer: []
    parameters:
      - name: status
        in: query
        type: string
        enum: [pending, accepted, in_progress, completed, cancelled]
      - name: view
        in: query
        type: string
        enum: [assigned, available]
        description: "For engineers: 'assigned' or 'available'"
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 20
    responses:
      200:
        description: List of requests
    """,
    
    "accept": """
    Accept a pending request (Engineer only)
    ---
    tags:
      - Requests
    security:
      - Bearer: []
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Request accepted
      400:
        description: Cannot accept (wrong status or subscription expired)
      403:
        description: Not authorized
      404:
        description: Request not found
    """,
    
    "complete": """
    Mark request as completed (Engineer only)
    ---
    tags:
      - Requests
    security:
      - Bearer: []
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Request completed, transaction created
      400:
        description: Cannot complete (wrong status)
      403:
        description: Not authorized
    """
}

ADMIN_DOCS = {
    "pending_engineers": """
    Get engineers pending approval
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: List of pending engineers
      403:
        description: Admin access required
    """,
    
    "approve_engineer": """
    Approve an engineer
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Engineer approved
      403:
        description: Admin access required
      404:
        description: Engineer not found
    """,
    
    "reject_engineer": """
    Reject an engineer
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: id
        in: path
        type: integer
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            reason:
              type: string
    responses:
      200:
        description: Engineer rejected
      403:
        description: Admin access required
    """,
    
    "stats": """
    Get platform statistics
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: Platform statistics
        schema:
          type: object
          properties:
            users:
              type: object
            requests:
              type: object
            reviews:
              type: object
            finance:
              type: object
    """
}
