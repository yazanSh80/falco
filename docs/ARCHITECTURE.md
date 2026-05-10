# FalcoElectrec — Architecture Design

**Team Lead:** Ahmad SAQER (1210085)  
**Partners:** Yazan Sharif (1220906), Ismail Tarteer (1211243)  
**Date:** December 23, 2025

---

## 1. Architecture Decision

### Decision: Keep React UI + Add Flask Backend

We will **NOT rebuild** the frontend. Instead, we will:
1. Keep the existing React/TypeScript/Vite frontend
2. Add a Flask REST API backend
3. Replace in-memory DataContext with API calls
4. Use MySQL for persistence

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    React + TypeScript + Vite                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │    │
│  │  │ Customer │  │ Engineer │  │  Admin   │  │ Auth (Login/     │ │    │
│  │  │  Pages   │  │  Pages   │  │  Pages   │  │    Signup)       │ │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │    │
│  │       │              │              │                │           │    │
│  │       └──────────────┴──────────────┴────────────────┘           │    │
│  │                              │                                    │    │
│  │                     ┌────────▼────────┐                          │    │
│  │                     │  API Client     │                          │    │
│  │                     │  (axios/fetch)  │                          │    │
│  │                     │  + JWT Token    │                          │    │
│  │                     └────────┬────────┘                          │    │
│  └──────────────────────────────┼───────────────────────────────────┘    │
│                                 │                                        │
└─────────────────────────────────┼────────────────────────────────────────┘
                                  │ HTTPS/REST
                                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Flask REST API                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │    │
│  │  │    Auth      │  │   Business   │  │      Admin            │ │    │
│  │  │  Blueprint   │  │  Blueprints  │  │    Blueprint          │ │    │
│  │  │ - register   │  │ - services   │  │ - approve engineers   │ │    │
│  │  │ - login      │  │ - requests   │  │ - manage users        │ │    │
│  │  │ - logout     │  │ - reviews    │  │ - view finances       │ │    │
│  │  │ - me         │  │ - blocks     │  │ - review reports      │ │    │
│  │  │              │  │ - notifs     │  │                       │ │    │
│  │  │              │  │ - finance    │  │                       │ │    │
│  │  │              │  │ - uploads    │  │                       │ │    │
│  │  └──────┬───────┘  └──────┬───────┘  └───────────┬───────────┘ │    │
│  │         │                  │                       │            │    │
│  │         └──────────────────┴───────────────────────┘            │    │
│  │                            │                                    │    │
│  │                   ┌────────▼────────┐                          │    │
│  │                   │  SQLAlchemy     │                          │    │
│  │                   │  ORM Layer      │                          │    │
│  │                   └────────┬────────┘                          │    │
│  └────────────────────────────┼─────────────────────────────────────┘    │
│                               │                                         │
└───────────────────────────────┼─────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          ┌──────────────────┐    ┌──────────────────┐
          │      MySQL       │    │  File Storage    │
          │                  │    │  (Local/S3)      │
          │   (All Envs)     │    │  ────────────    │
          │                  │    │  - CVs           │
          │                  │    │  - Certificates  │
          │                  │    │  - Portfolio     │
          │                  │    │  - Photos        │
          └──────────────────┘    └──────────────────┘
```

---

## 3. Roles & Permissions Matrix

### 3.1 Role Definitions

| Role | Description |
|------|-------------|
| **Customer** | End-user who requests electrical/home services |
| **Engineer** | Service provider (technician) who accepts and completes jobs |
| **Admin** | Platform administrator who manages users and approves engineers |

### 3.2 Permissions Matrix

| Resource / Action | Customer | Engineer | Admin |
|-------------------|:--------:|:--------:|:-----:|
| **Authentication** |
| Register | ✅ | ✅ | ❌ (created by admin) |
| Login | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| **Services** |
| View services catalog | ✅ | ✅ | ✅ |
| View prices | ✅ | ✅ | ✅ |
| **Requests** |
| Create request | ✅ | ❌ | ❌ |
| View own requests | ✅ | ❌ | ✅ |
| Cancel own request | ✅ | ❌ | ❌ |
| View available requests | ❌ | ✅* | ✅ |
| Accept request | ❌ | ✅* | ❌ |
| Complete request | ❌ | ✅ | ❌ |
| **Reviews** |
| Create review (after job) | ✅ | ✅ | ❌ |
| View reviews | ✅ | ✅ | ✅ |
| **Blocking** |
| Block user | ✅ | ✅ | ✅ |
| Unblock user | ✅ | ✅ | ✅ |
| **Notifications** |
| View own notifications | ✅ | ✅ | ✅ |
| Mark as read | ✅ | ✅ | ✅ |
| **Finance** |
| View own transactions | ✅ | ✅ | ❌ |
| View platform summary | ❌ | ❌ | ✅ |
| **Engineer Profile** |
| Edit portfolio | ❌ | ✅ | ❌ |
| Upload CV/certs | ❌ | ✅ | ❌ |
| View subscription status | ❌ | ✅ | ✅ |
| **Admin Functions** |
| Approve/reject engineers | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |
| Add new admin | ❌ | ❌ | ✅ |
| View all reviews | ❌ | ❌ | ✅ |

*\* Only if subscription is active*

---

## 4. Core Entities & Relationships

### 4.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│    User     │       │  EngineerProfile    │       │  PortfolioItem  │
├─────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK)     │──────<│ user_id (PK, FK)    │──────<│ id (PK)         │
│ name        │       │ specialization       │       │ engineer_id(FK) │
│ email       │       │ area                 │       │ title           │
│ phone       │       │ years_exp            │       │ description     │
│ password_   │       │ bio                  │       │ image_url       │
│   hash      │       │ cv_url               │       │ created_at      │
│ role        │       │ cert_url             │       └─────────────────┘
│ status      │       │ rating_avg           │
│ created_at  │       │ subscription_status  │
└──────┬──────┘       │ subscription_expiry  │
       │              └─────────────────────┘
       │
       │         ┌─────────────────┐
       │         │    Feature      │
       │         ├─────────────────┤
       │         │ id (PK)         │
       │         │ name            │
       │         │ icon            │
       │         └────────┬────────┘
       │                  │
       │                  ▼
       │         ┌─────────────────┐
       │         │    Service      │
       │         ├─────────────────┤
       │         │ id (PK)         │
       │         │ feature_id (FK) │
       │         │ name            │
       │         │ description     │
       │         │ base_price      │
       │         │ active          │
       │         └────────┬────────┘
       │                  │
       ▼                  ▼
┌──────────────────────────────────────────────┐
│                   Request                     │
├──────────────────────────────────────────────┤
│ id (PK)                                       │
│ customer_id (FK → User)                       │
│ service_id (FK → Service, nullable)          │
│ type (quick/late)                            │
│ description                                   │
│ location_text                                 │
│ location_lat (nullable)                       │
│ location_lng (nullable)                       │
│ status (pending/accepted/completed/cancelled)│
│ engineer_id (FK → User, nullable)            │
│ price_at_request                             │
│ created_at                                    │
│ completed_at (nullable)                       │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌───────────────┐     ┌───────────────────────┐
│    Review     │     │     Transaction       │
├───────────────┤     ├───────────────────────┤
│ id (PK)       │     │ id (PK)               │
│ request_id(FK)│     │ request_id (FK)       │
│ reviewer_id   │     │ customer_id (FK)      │
│   (FK→User)   │     │ engineer_id (FK)      │
│ reviewee_id   │     │ gross_amount          │
│   (FK→User)   │     │ commission_amount     │
│ rating (1-5)  │     │ net_amount            │
│ text          │     │ created_at            │
│ created_at    │     └───────────────────────┘
└───────────────┘

┌─────────────────┐     ┌─────────────────────┐
│     Block       │     │    Notification     │
├─────────────────┤     ├─────────────────────┤
│ id (PK)         │     │ id (PK)             │
│ blocker_id (FK) │     │ user_id (FK)        │
│ blocked_id (FK) │     │ type                │
│ reason          │     │ title               │
│ created_at      │     │ body                │
└─────────────────┘     │ read                │
                        │ created_at          │
                        └─────────────────────┘
```

### 4.2 Entity Descriptions

#### User
Central entity for all platform users (customers, engineers, admins).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID/Integer | Primary key |
| name | String(100) | Full name |
| email | String(100) | Unique, used for login |
| phone | String(20) | Contact number |
| password_hash | String(256) | Bcrypt hashed password |
| role | Enum | customer, engineer, admin |
| status | Enum | active, blocked, pending |
| created_at | DateTime | Registration timestamp |

#### EngineerProfile
Extended profile for users with engineer role.

| Field | Type | Description |
|-------|------|-------------|
| user_id | FK → User | One-to-one with User |
| specialization | String(100) | Primary service category |
| area | String(100) | Service area |
| years_exp | Integer | Years of experience |
| bio | Text | Professional biography |
| cv_url | String(255) | Path to CV file |
| cert_url | String(255) | Path to certificate |
| rating_avg | Decimal(3,2) | Computed average rating |
| subscription_status | Enum | active, expired |
| subscription_expiry | Date | Expiration date |

#### Feature (Service Category)
Categories for grouping services.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (e.g., F1, F2) |
| name | String(100) | Category name |
| icon | String(50) | Icon identifier |

#### Service
Individual services offered on the platform.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| feature_id | FK → Feature | Parent category |
| name | String(100) | Service name |
| description | Text | Service description |
| base_price | Decimal(10,2) | Standard price in NIS |
| active | Boolean | Is service available |

#### Request
Service requests created by customers.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (R-xxxx format) |
| customer_id | FK → User | Customer who created |
| service_id | FK → Service | Selected service (nullable for quick) |
| type | Enum | quick, late |
| description | Text | Problem description |
| location_text | String(255) | Address text |
| location_lat | Decimal | Latitude (optional) |
| location_lng | Decimal | Longitude (optional) |
| status | Enum | pending, accepted, completed, cancelled |
| engineer_id | FK → User | Assigned engineer |
| price_at_request | Decimal | Frozen price at creation |
| created_at | DateTime | Creation timestamp |
| completed_at | DateTime | Completion timestamp |

#### Review
Ratings and reviews after job completion.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| request_id | FK → Request | Associated job |
| reviewer_id | FK → User | Who wrote the review |
| reviewee_id | FK → User | Who is being reviewed |
| rating | Integer(1-5) | Star rating |
| text | Text | Review comment |
| created_at | DateTime | Review timestamp |

#### Transaction
Financial records for completed jobs.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| request_id | FK → Request | Associated job |
| customer_id | FK → User | Customer |
| engineer_id | FK → User | Engineer |
| gross_amount | Decimal | Total charged |
| commission_amount | Decimal | Platform fee |
| net_amount | Decimal | Engineer receives |
| created_at | DateTime | Transaction timestamp |

**Commission Rule:**
- gross_amount ≤ 700 NIS → commission = 0%
- gross_amount > 700 NIS → commission = 5%

#### Block
User blocking relationships.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| blocker_id | FK → User | User who blocked |
| blocked_id | FK → User | User who is blocked |
| reason | Text | Optional reason |
| created_at | DateTime | Block timestamp |

#### Notification
In-app notifications.

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| user_id | FK → User | Recipient |
| type | String | request_created, accepted, completed, review |
| title | String(100) | Notification title |
| body | Text | Notification content |
| read | Boolean | Read status |
| created_at | DateTime | Creation timestamp |

---

## 5. API Structure

### 5.1 Blueprint Organization

```
/api
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── GET  /me
│
├── /services
│   ├── GET  /features
│   ├── GET  /          (query: feature_id)
│   └── GET  /:id
│
├── /requests
│   ├── POST /          (create - customer)
│   ├── GET  /          (list - filtered by role)
│   ├── GET  /:id
│   ├── POST /:id/accept   (engineer)
│   ├── POST /:id/complete (engineer)
│   └── DELETE /:id        (cancel - customer)
│
├── /reviews
│   ├── POST /
│   └── GET  /          (query: user_id)
│
├── /blocks
│   ├── POST /
│   ├── DELETE /:id
│   └── GET  /
│
├── /notifications
│   ├── GET  /
│   ├── POST /:id/read
│   └── POST /read-all
│
├── /finance
│   ├── GET  /customer
│   ├── GET  /engineer
│   └── GET  /admin/summary
│
├── /engineer
│   ├── GET  /profile
│   ├── PUT  /profile
│   ├── POST /portfolio
│   └── DELETE /portfolio/:id
│
├── /uploads
│   └── POST /          (multipart file upload)
│
└── /admin
    ├── GET  /engineers/pending
    ├── POST /engineers/:id/accept
    ├── POST /engineers/:id/reject
    ├── GET  /users
    ├── DELETE /users/:id
    ├── POST /users/:id/block
    ├── POST /users/:id/unblock
    └── GET  /reviews
```

### 5.2 Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Flask   │         │    DB    │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /auth/login  │                    │
     │  {email, password} │                    │
     │───────────────────>│                    │
     │                    │   Find user        │
     │                    │───────────────────>│
     │                    │   User data        │
     │                    │<───────────────────│
     │                    │                    │
     │                    │ Verify password    │
     │                    │ Generate JWT       │
     │                    │                    │
     │  {access_token,    │                    │
     │   user: {...}}     │                    │
     │<───────────────────│                    │
     │                    │                    │
     │  GET /requests     │                    │
     │  Authorization:    │                    │
     │  Bearer <token>    │                    │
     │───────────────────>│                    │
     │                    │ Validate JWT       │
     │                    │ Extract user_id    │
     │                    │───────────────────>│
     │                    │   Requests data    │
     │                    │<───────────────────│
     │   [requests...]    │                    │
     │<───────────────────│                    │
     │                    │                    │
```

---

## 6. Directory Structure

```
falco/
├── frontend/                    # React application (existing)
│   ├── src/
│   │   ├── api/                 # NEW: API client
│   │   │   ├── client.ts        # Axios/fetch wrapper
│   │   │   ├── auth.ts          # Auth endpoints
│   │   │   ├── services.ts      # Services endpoints
│   │   │   ├── requests.ts      # Requests endpoints
│   │   │   └── ...
│   │   ├── components/
│   │   ├── pages/
│   │   ├── state/
│   │   │   └── DataContext.tsx  # Refactored to use API
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Flask application (NEW)
│   ├── app/
│   │   ├── __init__.py          # App factory
│   │   ├── config.py            # Configuration
│   │   ├── extensions.py        # Flask extensions
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── services.py
│   │   │   ├── requests.py
│   │   │   ├── reviews.py
│   │   │   ├── blocks.py
│   │   │   ├── notifications.py
│   │   │   ├── finance.py
│   │   │   ├── engineer.py
│   │   │   ├── uploads.py
│   │   │   └── admin.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── engineer_profile.py
│   │   │   ├── service.py
│   │   │   ├── request.py
│   │   │   ├── review.py
│   │   │   ├── block.py
│   │   │   ├── notification.py
│   │   │   └── transaction.py
│   │   ├── services/            # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── request_service.py
│   │   │   └── finance_service.py
│   │   └── utils/
│   │       ├── decorators.py    # @require_role, etc.
│   │       └── validators.py
│   ├── migrations/              # Alembic migrations
│   ├── uploads/                 # File storage
│   ├── tests/
│   ├── seed.py                  # Database seeding
│   ├── requirements.txt
│   └── Dockerfile
│
├── docs/                        # Documentation
│   ├── CURRENT_STATE.md
│   ├── ARCHITECTURE.md
│   ├── REFERENCES.md
│   ├── MARKET_STUDY.md
│   └── figures/
│
├── docker-compose.yml
├── .env.example
├── Makefile
└── README.md
```

---

## 7. Technology Choices

| Component | Technology | Justification |
|-----------|------------|---------------|
| Frontend | React 18 + TypeScript | Existing, well-structured |
| Build Tool | Vite | Fast, modern, already configured |
| Styling | TailwindCSS | Already integrated |
| Backend | Flask 3.x | Lightweight, Python, quick to develop |
| ORM | SQLAlchemy 2.x | Industry standard, flexible |
| Migrations | Flask-Migrate (Alembic) | Reliable schema management |
| Auth | Flask-JWT-Extended | JWT tokens, role support |
| CORS | Flask-CORS | Cross-origin requests |
| Database | MySQL | Robust, scalable, consistent across environments |
| File Upload | Local storage | Simple for graduation demo |
| Containerization | Docker + Compose | Reproducible deployment |

---

## 8. Security Considerations

1. **Password Storage:** Bcrypt hashing via werkzeug.security
2. **JWT Tokens:** Short expiry (15-60 min), refresh tokens optional
3. **CORS:** Whitelist frontend origin only
4. **Input Validation:** Server-side validation on all endpoints
5. **File Uploads:** Type validation, size limits, unique filenames
6. **Role Checks:** Decorator-based RBAC on all protected endpoints
7. **SQL Injection:** ORM parameterized queries
8. **Rate Limiting:** Optional (Flask-Limiter)

---

## 9. Demo Accounts

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| customer@test.com | Pass123! | Customer | Standard user |
| engineer@test.com | Pass123! | Engineer | Active subscription |
| expired@test.com | Pass123! | Engineer | Expired subscription |
| admin@test.com | Pass123! | Admin | Full access |

---

*Document generated as part of T0.2 — Architecture Decision*
