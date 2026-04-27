# Falco Electrec - Database Analysis & Schema Documentation

## Executive Summary

This document provides a comprehensive analysis of the **Falco Electrec** backend database structure based on the existing SQLAlchemy models. The analysis identifies **14 tables** with complete entity-relationship mapping, constraints, indexes, and business logic requirements.

**Framework**: Flask + SQLAlchemy + Flask-Migrate (Alembic)
**Database Driver**: PyMySQL (configured in requirements.txt)
**Database**: MySQL 8.0
**Credentials**: root / Yy@102030 / Graduation

---

## Table of Contents
1. [Database Architecture Overview](#database-architecture-overview)
2. [Entity Definitions](#entity-definitions)
3. [Relationships & Cardinality](#relationships--cardinality)
4. [Data Constraints & Validation](#data-constraints--validation)
5. [Indexes & Performance](#indexes--performance)
6. [Business Rules & Workflows](#business-rules--workflows)
7. [SQL Schema Definition](#sql-schema-definition)
8. [Implementation Steps](#implementation-steps)

---

## Database Architecture Overview

### System Components
- **Users**: Multi-role system (Admin, Engineer, Customer)
- **Services**: Catalog of available services (features and offerings)
- **Requests**: Core business entity - service requests with SLA tracking
- **Reviews**: Post-completion ratings and feedback
- **Finance**: Transaction tracking with commission calculations
- **Safety**: User blocking, disputes, and dispute resolution
- **Notifications**: In-app notification system
- **Audit**: Admin action logging for compliance
- **Portfolio**: Engineer portfolio items for showcasing work
- **Areas**: Geographic service coverage areas

---

## Entity Definitions

### 1. USERS Table
**Purpose**: Core user account management for all user types

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique user identifier |
| name | VARCHAR(100) | NOT NULL | User full name |
| email | VARCHAR(100) | NOT NULL, UNIQUE, INDEX | Email used for login |
| phone | VARCHAR(20) | NULLABLE | Contact phone number |
| password_hash | VARCHAR(256) | NOT NULL | Hashed password (bcrypt) |
| role | VARCHAR(20) | NOT NULL, DEFAULT='customer' | Enum: 'customer', 'engineer', 'admin' |
| status | VARCHAR(20) | NOT NULL, DEFAULT='active' | Enum: 'active', 'blocked', 'pending' |
| city | VARCHAR(100) | NULLABLE | City/residence |
| area | VARCHAR(100) | NULLABLE | Service area |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation date |
| updated_at | DATETIME | DEFAULT CURRENT_TIMESTAMP, AUTO_UPDATE | Last update |

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: email
- INDEX: email, status, role, created_at

**Enums**:
```python
UserRole = ['customer', 'engineer', 'admin']
UserStatus = ['active', 'blocked', 'pending']
```

**Relationships**:
- 1 → 1: user → engineer_profile
- 1 → M: user → requests (as customer_id)
- 1 → M: user → requests (as engineer_id)
- 1 → M: user → reviews (as reviewer/reviewee)
- 1 → M: user → notifications
- 1 → M: user → blocks (bidirectional)

---

### 2. ENGINEER_PROFILES Table
**Purpose**: Extended profile for registered engineers

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | INT | FK(users.id), PK | Links to user account |
| specialization | VARCHAR(100) | NOT NULL | Main skill area (e.g., 'A/C Maintenance') |
| years_exp | INT | DEFAULT=0 | Years of experience |
| bio | TEXT | NULLABLE | Professional biography |
| cv_url | VARCHAR(255) | NULLABLE | Uploaded CV file path |
| certificate_url | VARCHAR(255) | NULLABLE | Certification document path |
| rating_avg | FLOAT | DEFAULT=0.0 | Average rating (1-5 stars) |
| rating_count | INT | DEFAULT=0 | Total number of ratings |
| subscription_status | VARCHAR(20) | DEFAULT='active' | Enum: 'active', 'expired' |
| subscription_expiry | DATE | NULLABLE | Subscription end date |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Profile creation date |
| updated_at | DATETIME | AUTO_UPDATE | Last modification |

**Indexes**:
- PRIMARY KEY: user_id (FK)
- INDEX: specialization, subscription_status

**Relationships**:
- 1 → M: engineer_profile → portfolio_items

**Business Logic**:
- Subscription validation: Check `subscription_status` and `subscription_expiry` date
- Rating update: Calculated from Reviews via UPDATE triggers
- Only users with role='engineer' have a profile

---

### 3. SERVICES Table
**Purpose**: Predefined service offerings catalog

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | VARCHAR(10) | PK | Service code (e.g., 'AC001') |
| feature_id | VARCHAR(10) | FK(features.id), NOT NULL, INDEX | Category service belongs to |
| name | VARCHAR(100) | NOT NULL | Service name |
| description | TEXT | NULLABLE | Detailed description |
| base_price | FLOAT | NOT NULL | Base pricing for quotes |
| active | BOOLEAN | DEFAULT=TRUE | Soft delete flag |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | DATETIME | AUTO_UPDATE | Last update |

**Indexes**:
- PRIMARY KEY: id
- INDEX: feature_id, active

**Relationships**:
- M → 1: services → features
- 1 → M: services → requests

**Sample Data Structure**:
```
Feature: AC_MAINTENANCE (id)
  └─ Service: AC001 - General A/C Maintenance (800 NIS)
  └─ Service: AC002 - A/C Installation (1500 NIS)
```

---

### 4. FEATURES Table
**Purpose**: Service categories/features classification

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | VARCHAR(10) | PK | Feature code |
| name | VARCHAR(100) | NOT NULL | Feature display name |
| icon | VARCHAR(50) | NULLABLE | Icon identifier for UI |
| description | TEXT | NULLABLE | Feature description |
| active | BOOLEAN | DEFAULT=TRUE | Visibility flag |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation date |

**Indexes**:
- PRIMARY KEY: id
- INDEX: active

**Relationships**:
- 1 → M: features → services

**Sample Data**:
- AC_MAINTENANCE
- PLUMBING
- CARPENTRY
- ELECTRICITY
- ALUMETAL  
- PAINTING
- OTHERS

---

### 5. REQUESTS Table
**Purpose**: Core business entity - service requests with SLA tracking

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique request ID |
| request_number | VARCHAR(20) | UNIQUE, NOT NULL, INDEX | Human-readable reference (R-0001) |
| customer_id | INT | FK(users.id), NOT NULL, INDEX | Customer who created request |
| service_id | VARCHAR(10) | FK(services.id), NULLABLE | Service category (null for quick requests) |
| type | VARCHAR(10) | NOT NULL, DEFAULT='quick' | Enum: 'quick', 'late' |
| category | VARCHAR(100) | NULLABLE | Free-form category (for 'quick' type) |
| description | TEXT | NOT NULL | Full problem description |
| location_text | VARCHAR(255) | NOT NULL | Address/location string |
| location_lat | FLOAT | NULLABLE | GPS latitude |
| location_lng | FLOAT | NULLABLE | GPS longitude |
| status | VARCHAR(20) | NOT NULL, DEFAULT='pending', INDEX | Enum: 'pending', 'accepted', 'in_progress', 'completed', 'cancelled' |
| engineer_id | INT | FK(users.id), NULLABLE, INDEX | Assigned engineer |
| price_at_request | FLOAT | NULLABLE | Final agreed price |
| preferred_time | DATETIME | NULLABLE | Customer's preferred time |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP, INDEX | Request creation time |
| accepted_at | DATETIME | NULLABLE | When engineer accepted |
| started_at | DATETIME | NULLABLE | When work actually started |
| completed_at | DATETIME | NULLABLE | When work was completed |
| cancelled_at | DATETIME | NULLABLE | When request was cancelled |
| sla_response_deadline | DATETIME | NULLABLE | SLA response deadline |
| sla_completion_deadline | DATETIME | NULLABLE | SLA completion deadline |
| sla_response_breached | BOOLEAN | DEFAULT=FALSE | Response time SLA violated |
| sla_completion_breached | BOOLEAN | DEFAULT=FALSE | Completion time SLA violated |

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: request_number
- INDEX: status, customer_id, engineer_id, created_at

**Foreign Keys**:
- customer_id → users.id
- engineer_id → users.id
- service_id → services.id

**Relationships**:
- M → 1: requests → users (customer)
- M → 1: requests → users (engineer, nullable)
- M → 1: requests → services (nullable)
- 1 → M: requests → reviews
- 1 → 1: requests → transactions (one-sided, unique)
- 1 → M: requests → disputes

**SLA Configuration** (from code):
```
For type='quick':
  - response_time: 2 hours (accept deadline)
  - completion_time: 24 hours (after acceptance)

For type='late':
  - response_time: 24 hours (accept deadline)
  - completion_time: 72 hours (after acceptance)
```

**Important Business Rules**:
1. SLA deadlines set on request creation
2. SLA breach detection based on status and current time comparison
3. Request number auto-generated: R-{sequence}
4. Status transitions: PENDING → ACCEPTED → IN_PROGRESS → COMPLETED or CANCELLED

---

### 6. REVIEWS Table
**Purpose**: Post-completion ratings and feedback from customers/engineers

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique review ID |
| request_id | INT | FK(requests.id), NOT NULL, INDEX | Related service request |
| reviewer_id | INT | FK(users.id), NOT NULL, INDEX | User giving the review |
| reviewee_id | INT | FK(users.id), NOT NULL | User being reviewed |
| rating | INT | NOT NULL, CHECK(1-5 range) | Star rating (1-5) |
| text | TEXT | NULLABLE | Review comment/feedback |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Review creation date |

**Constraints**:
- CHECK: rating >= 1 AND rating <= 5
- UNIQUE: (request_id, reviewer_id) - Only one review per user per request

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: (request_id, reviewer_id)
- INDEX: request_id, reviewer_id, reviewee_id

**Relationships**:
- M → 1: reviews → requests
- M → 1: reviews → users (reviewer)
- M → 1: reviews → users (reviewee)

**Business Logic**:
- Bidirectional reviews (customer reviews engineer and vice versa)
- Updates engineer_profiles.rating_avg upon creation/modification
- Used to compute engineer reputation scores

---

### 7. TRANSACTIONS Table
**Purpose**: Financial transaction tracking with commission calculations

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique transaction ID |
| request_id | INT | FK(requests.id), NOT NULL, UNIQUE | One transaction per completed request |
| customer_id | INT | FK(users.id), NOT NULL, INDEX | Customer paying |
| engineer_id | INT | FK(users.id), NOT NULL, INDEX | Engineer earning |
| gross_amount | FLOAT | NOT NULL | Original quoted price |
| commission_rate | FLOAT | NOT NULL | Commission percentage (0.0 or 0.05) |
| commission_amount | FLOAT | NOT NULL | Calculated commission (5% or 0%) |
| net_amount | FLOAT | NOT NULL | Amount paid to engineer (gross - commission) |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Transaction date |

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: request_id
- INDEX: customer_id, engineer_id

**Relationships**:
- M → 1: transactions → requests
- M → 1: transactions → users (customer)
- M → 1: transactions → users (engineer)

**Commission Rules** (Business Critical):
```
If gross_amount <= 700 NIS:
    commission_rate = 0%
    commission_amount = 0
    net_amount = gross_amount

If gross_amount > 700 NIS:
    commission_rate = 5%
    commission_amount = gross_amount * 0.05
    net_amount = gross_amount - commission_amount
```

**Threshold Constant**: 700 NIS (COMMISSION_THRESHOLD)

---

### 8. PORTFOLIO_ITEMS Table
**Purpose**: Engineer portfolio items showcasing completed work

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique portfolio item ID |
| engineer_id | INT | FK(engineer_profiles.user_id), NOT NULL, INDEX | Engineer who owns portfolio |
| title | VARCHAR(100) | NOT NULL | Portfolio item title |
| description | TEXT | NULLABLE | Detailed description of work |
| location | VARCHAR(100) | NULLABLE | Work location |
| image_url | VARCHAR(255) | NULLABLE | Uploaded image file path |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation date |

**Indexes**:
- PRIMARY KEY: id
- INDEX: engineer_id

**Relationships**:
- M → 1: portfolio_items → engineer_profiles

**Business Logic**:
- Only engineers (role='engineer') can have portfolio items
- Soft relationship through engineer_id to user's engineer profile

---

### 9. BLOCKS Table
**Purpose**: User blocking relationships for safety/spam prevention

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique block ID |
| blocker_id | INT | FK(users.id), NOT NULL, INDEX | User doing the blocking |
| blocked_id | INT | FK(users.id), NOT NULL | User being blocked |
| reason | TEXT | NULLABLE | Reason for blocking |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Block creation date |

**Constraints**:
- UNIQUE: (blocker_id, blocked_id)
- CHECK: blocker_id != blocked_id (no self-blocking)

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: (blocker_id, blocked_id)
- INDEX: blocker_id, blocked_id

**Relationships**:
- M → 1: blocks → users (blocker)
- M → 1: blocks → users (blocked)

**Important**: Bidirectional check - Block.is_blocked(user1, user2) checks both directions

---

### 10. NOTIFICATIONS Table
**Purpose**: In-app notification system for user alerts

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique notification ID |
| user_id | INT | FK(users.id), NOT NULL, INDEX | Recipient user |
| type | VARCHAR(50) | NOT NULL, DEFAULT='general' | Enum: see NotificationType |
| title | VARCHAR(100) | NOT NULL | Notification title |
| body | TEXT | NULLABLE | Detailed message |
| read | BOOLEAN | DEFAULT=FALSE, INDEX | Read status |
| reference_id | INT | NULLABLE | Related request/review ID |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP, INDEX | Notification creation time |

**Indexes**:
- PRIMARY KEY: id
- INDEX: user_id, read, created_at

**Relationships**:
- M → 1: notifications → users

**Notification Types**:
```
REQUEST_CREATED
REQUEST_ACCEPTED
REQUEST_COMPLETED
REQUEST_CANCELLED
REVIEW_RECEIVED
ACCOUNT_APPROVED
ACCOUNT_REJECTED
SUBSCRIPTION_EXPIRING
GENERAL
```

**Business Logic**:
- Static helper methods for creating specific notification types
- Reference_id links to related requests or reviews
- Used for timeline-based events in user dashboard

---

### 11. DISPUTES Table
**Purpose**: Handling complaints and dispute resolution between users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique dispute ID |
| request_id | INT | FK(requests.id), NOT NULL, INDEX | Related service request |
| created_by | INT | FK(users.id), NOT NULL, INDEX | User filing complaint |
| against_user_id | INT | FK(users.id), NOT NULL | User being complained about |
| category | VARCHAR(50) | NOT NULL | Enum: 'quality', 'incomplete', 'overcharge', 'delay', 'behavior', 'damage', 'other' |
| description | TEXT | NOT NULL | Complaint details |
| status | VARCHAR(20) | NOT NULL, DEFAULT='open', INDEX | Enum: 'open', 'in_review', 'resolved', 'rejected' |
| resolved_by | INT | FK(users.id), NULLABLE | Admin who resolved (if applicable) |
| resolution_action | VARCHAR(50) | NULLABLE | Enum: see ResolutionAction |
| resolution_notes | TEXT | NULLABLE | Admin's notes on resolution |
| refund_amount | FLOAT | NULLABLE | Refund amount if applicable |
| resolved_at | DATETIME | NULLABLE | Resolution/rejection date |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP, INDEX | Complaint creation date |
| updated_at | DATETIME | AUTO_UPDATE | Last modification |

**Indexes**:
- PRIMARY KEY: id
- INDEX: status, request_id, created_by

**Relationships**:
- M → 1: disputes → requests
- M → 1: disputes → users (creator)
- M → 1: disputes → users (against)
- M → 1: disputes → users (resolver/null)

**Enums**:
```
DisputeStatus: 'open', 'in_review', 'resolved', 'rejected'
DisputeCategory: 'quality', 'incomplete', 'overcharge', 'delay', 'behavior', 'damage', 'other'
ResolutionAction: 'no_action', 'partial_refund', 'full_refund', 'warn_engineer', 
                  'warn_customer', 'block_engineer', 'block_customer'
```

**Business Rules**:
- Disputes must be filed within 7 days (DISPUTE_WINDOW_DAYS = 7)
- Only admins can resolve disputes
- Can result in refunds or blocks on user accounts
- Audit trail through AdminActionLogs

---

### 12. AREAS Table
**Purpose**: Geographic service coverage areas/regions

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique area ID |
| name | VARCHAR(100) | UNIQUE, NOT NULL, INDEX | Area name (e.g., 'Hebron City') |
| name_ar | VARCHAR(100) | NULLABLE | Arabic name (e.g., 'الخليل') |
| description | TEXT | NULLABLE | Area description |
| is_active | BOOLEAN | DEFAULT=TRUE, INDEX | Availability flag |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation date |
| updated_at | DATETIME | AUTO_UPDATE | Last modification |

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: name
- INDEX: is_active

**Business Logic**:
- No direct FK in this table; users reference by name (string) in users.area
- Bidirectional: Areas record service coverage, users record their service area
- Computed properties: engineer_count, customer_count, request_count

---

### 13. TOKEN_BLOCKLIST Table
**Purpose**: Revoked JWT tokens for security (force logout, token invalidation)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique blocklist entry ID |
| jti | VARCHAR(36) | NOT NULL, UNIQUE, INDEX | JWT ID claim (unique ID per token) |
| user_id | INT | FK(users.id), NULLABLE, INDEX | User associated with token |
| token_type | VARCHAR(10) | NOT NULL | 'access' or 'refresh' |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | When token was revoked |
| expires_at | DATETIME | NULLABLE | Token expiration time |
| revoked_by | INT | FK(users.id), NULLABLE | Admin who revoked (if applicable) |
| reason | VARCHAR(255) | NULLABLE | Reason for revocation |

**Indexes**:
- PRIMARY KEY: id
- UNIQUE: jti
- INDEX: user_id, token_type

**Relationships**:
- M → 1: token_blocklist → users (user_id)
- M → 1: token_blocklist → users (revoked_by)

**Business Logic**:
- Check jti against blocklist on each protected API call
- Can cleanup expired entries to save space
- Used for manual logout and admin force-logout

---

### 14. ADMIN_ACTION_LOGS Table
**Purpose**: Audit trail of all administrative actions for compliance

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK, AUTO_INCREMENT | Unique audit log ID |
| admin_id | INT | FK(users.id), NOT NULL, INDEX | Admin who performed action |
| action_type | VARCHAR(50) | NOT NULL, INDEX | Type of action (enum) |
| target_type | VARCHAR(50) | NULLABLE | Type of target entity ('user', 'dispute', 'service') |
| target_id | INT | NULLABLE, INDEX | ID of the target entity |
| details_json | JSON | NULLABLE | Additional details as JSON object |
| ip_address | VARCHAR(50) | NULLABLE | Admin's IP address |
| user_agent | VARCHAR(255) | NULLABLE | Admin's browser/client info |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP, INDEX | When action occurred |

**Indexes**:
- PRIMARY KEY: id
- INDEX: admin_id, action_type, target_id, created_at

**Relationships**:
- M → 1: admin_action_logs → users (admin)

**Action Types** (from AdminActionType enum):
```
APPROVE_ENGINEER, REJECT_ENGINEER, BLOCK_USER, UNBLOCK_USER, DELETE_USER,
CREATE_ADMIN, RESOLVE_DISPUTE, REJECT_DISPUTE, UPDATE_DISPUTE_STATUS,
MODIFY_SERVICE, SYSTEM_CONFIG, FORCE_LOGOUT, DISABLE_LOGIN, 
RESET_SUBSCRIPTION, CANCEL_REQUEST, CREATE_AREA, UPDATE_AREA, 
DELETE_AREA, UPDATE_ENGINEER_PERMISSIONS, EXPORT_ENGINEERS, 
EXPORT_FINANCE,EXPORT_REQUESTS, EXPORT_USERS
```

**Audit Trail Features**:
- IP tracking for security analysis
- User agent for device identification
- JSON flexible storage for action-specific details
- Complete audit trail for compliance

---

## Relationships & Cardinality

### Entity Relationship Diagram (Text Representation)

```
USERS (multi-role: customer, engineer, admin)
├── 1:1 → ENGINEER_PROFILES (if role='engineer')
│   └── 1:M → PORTFOLIO_ITEMS
├── 1:M → REQUESTS (as customer_id)
├── 1:M → REQUESTS (as engineer_id, nullable)
├── 1:M → REVIEWS (as reviewer_id)
├── 1:M → REVIEWS (as reviewee_id)
├── 1:M → NOTIFICATIONS
├── 1:M → BLOCKS (as blocker_id)
├── 1:M → BLOCKS (as blocked_id)
├── 1:M → TRANSACTIONS (as customer_id)
├── 1:M → TRANSACTIONS (as engineer_id)
├── 1:M → DISPUTES (as creator)
├── 1:M → DISPUTES (as against_user)
├── 1:M → DISPUTES (as resolver_id)
├── 1:M → ADMIN_ACTION_LOGS
└── 1:M → TOKEN_BLOCKLIST

FEATURES
└── 1:M → SERVICES

SERVICES
└── 1:M → REQUESTS

REQUESTS
├── 1:M → REVIEWS
├── 1:1 → TRANSACTIONS (one-sided unique)
├── 1:M → DISPUTES
└── (FK to USERS for customer_id, engineer_id)
    (FK to SERVICES, nullable)

AREAS
└── (No direct FK; referenced by name in USERS.area)
```

### Key Cardinalities

| Relationship | Cardinality | Notes |
|--------------|-------------|-------|
| User → Engineer Profile | 1:1 | Only for engineers; optional relationship |
| Engineer → Portfolio Items | 1:M | Multiple portfolio items per engineer |
| Feature → Services | 1:M | One feature can have multiple services |
| Service → Requests | 1:M | Service can have many requests |
| User (Customer) → Requests | 1:M | Customer creates many requests |
| User (Engineer) → Requests | 1:M | Engineer accepts many requests |
| Request → Reviews | 1:M | One request can have multiple reviews (customer→engineer, engineer→customer) |
| Request → Transaction | 1:1 | Unique: Only one transaction per completed request |
| Request → Disputes | 1:M | Request can have multiple disputes |
| User → Blocks | M:M | Bidirectional blocking via unique constraints |
| User → Notifications | 1:M | User receives many notifications |
| User → Transactions | 1:M | Both as customer and engineer |

---

## Data Constraints & Validation

### Column Constraints

#### CHECK Constraints
```sql
-- Reviews: Star rating must be 1-5
ALTER TABLE reviews ADD CONSTRAINT check_rating_range CHECK (rating >= 1 AND rating <= 5);

-- Blocks: Cannot block yourself
ALTER TABLE blocks ADD CONSTRAINT no_self_block CHECK (blocker_id != blocked_id);
```

#### UNIQUE Constraints
```sql
-- User email uniqueness (for login)
ALTER TABLE users ADD UNIQUE KEY unique_email (email);

-- Request number uniqueness (human reference)
ALTER TABLE requests ADD UNIQUE KEY unique_request_number (request_number);

-- One review per user per request
ALTER TABLE reviews ADD UNIQUE KEY unique_review_per_request_per_user (request_id, reviewer_id);

-- One block per user pair
ALTER TABLE blocks ADD UNIQUE KEY unique_block (blocker_id, blocked_id);

-- Area name uniqueness
ALTER TABLE areas ADD UNIQUE KEY unique_area_name (name);

-- One transaction per request
ALTER TABLE transactions ADD UNIQUE KEY unique_transaction_per_request (request_id);

-- Token can only be blocked once
ALTER TABLE token_blocklist ADD UNIQUE KEY unique_jti (jti);
```

#### Foreign Key Constraints
```sql
-- Cascading delete for data integrity
ALTER TABLE engineer_profiles DROP FOREIGN KEY engineer_profiles_fk_users;
ALTER TABLE engineer_profiles ADD CONSTRAINT engineer_profiles_fk_users 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE notifications DROP FOREIGN KEY notifications_fk_users;
ALTER TABLE notifications ADD CONSTRAINT notifications_fk_users 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Restrict delete for shared resources
ALTER TABLE requests ADD CONSTRAINT requests_fk_service 
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;
```

---

## Indexes & Performance

### Comprehensive Index Strategy

**PRIMARY KEYS** (Automatic Indexes):
- All tables have primary key indexes on `id` or appropriate composite key

**Performance Critical Indexes**:

```sql
-- Users: Authentication and lookup
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_users_area ON users(area);

-- Requests: Most common query patterns
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_customer_id ON requests(customer_id);
CREATE INDEX idx_requests_engineer_id ON requests(engineer_id);
CREATE INDEX idx_requests_created_at ON requests(created_at);
CREATE INDEX idx_requests_request_number ON requests(request_number);
CREATE UNIQUE INDEX idx_requests_request_number_unique ON requests(request_number);

-- Reviews: User reputation calculation
CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_request_id ON reviews(request_id);
CREATE UNIQUE INDEX idx_reviews_request_reviewer ON reviews(request_id, reviewer_id);

-- Transactions: Financial reports
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_engineer_id ON transactions(engineer_id);

-- Notifications: Real-time alerts
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Blocks: Safety checks
CREATE INDEX idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_id ON blocks(blocked_id);

-- Admin Logs: Audit trail
CREATE INDEX idx_admin_action_logs_admin_id ON admin_action_logs(admin_id);
CREATE INDEX idx_admin_action_logs_action_type ON admin_action_logs(action_type);
CREATE INDEX idx_admin_action_logs_created_at ON admin_action_logs(created_at);

-- Disputes: Status tracking
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_request_id ON disputes(request_id);

-- Token Blocklist: JWT validation
CREATE INDEX idx_token_blocklist_jti ON token_blocklist(jti);
CREATE UNIQUE INDEX idx_token_blocklist_jti_unique ON token_blocklist(jti);

-- Services & Features: Catalog queries
CREATE INDEX idx_services_feature_id ON services(feature_id);
CREATE INDEX idx_services_active ON services(active);

-- Areas: Availability queries
CREATE INDEX idx_areas_is_active ON areas(is_active);

-- Portfolio: Engineer showcase
CREATE INDEX idx_portfolio_items_engineer_id ON portfolio_items(engineer_id);
```

**Estimated Query Performance Impact**:
- Email lookup: O(log n) via index vs O(n) full scan
- Request status queries: O(log n) for filtered aggregations
- Reviews calculation: O(log n) for user reputation
- Block checks: O(1) via unique constraint + index

---

## Business Rules & Workflows

### 1. REQUEST LIFECYCLE

```
State Machine:
PENDING
  ├─ [Engineer accepts] → ACCEPTED → [Work starts] → IN_PROGRESS → [Work completes] → COMPLETED
  │                                                      (SLA tracking)               (Create transaction)
  └─ [Customer cancels] → CANCELLED OR [SLA response breached, auto-cancelled]

Key Business Rules:
- SLA tracking starts at PENDING state
- Response deadline: 2hrs (quick) or 24hrs (late)
- Completion deadline: 24hrs (quick) or 72hrs (late) after ACCEPTED
- Only PENDING requests can be accepted/cancelled
- COMPLETED requests create TRANSACTIONS
- Multiple DISPUTES can be filed for COMPLETED requests (within 7 days)
```

### 2. COMMISSION CALCULATION

```
On Transaction Creation:
- gross_amount = request.price_at_request OR service.base_price

if gross_amount <= 700 NIS:
    commission_rate = 0%
    Platform takes: 0
    Engineer receives: 100%
    
else (gross_amount > 700 NIS):
    commission_rate = 5%
    Platform takes: gross_amount * 0.05
    Engineer receives: gross_amount * 0.95

Example scenarios:
- 500 NIS job → Engineer gets 500 NIS (0% commission)
- 700 NIS job → Engineer gets 700 NIS (0% commission)
- 800 NIS job → Engineer gets 760 NIS (40 NIS commission)
- 1000 NIS job → Engineer gets 950 NIS (50 NIS commission)
```

### 3. REVIEW & RATING SYSTEM

```
Review Creation:
- After REQUEST marked COMPLETED
- Both parties (customer and engineer) can review each other
- Rating: 1-5 stars only
- Unique constraint: One review per request per user

Rating Aggregation:
- On new review: Update engineer_profiles.rating_avg
- Formula: (previous_avg * count + new_rating) / (count + 1)
- Stored as FLOAT with 2 decimal precision
- rating_count incremented by 1

Reputation Display:
- Engineer profile shows: rating_avg, rating_count, is_subscription_active
- Used for engineer discovery and filtering
```

### 4. SUBSCRIPTION MANAGEMENT

```
Subscription Status:
- Each engineer has: subscription_status, subscription_expiry

Active Subscription:
- subscription_status == 'active' AND
- subscription_expiry >= today()

Expired Subscription:
- subscription_status == 'expired' OR
- subscription_expiry < today()

Business Logic:
- Can only ACCEPT new requests if subscription is active
- Notifications: SUBSCRIPTION_EXPIRING alerts 7 days before expiry
- Admin can reset subscription_expiry date
```

### 5. BLOCKING & SAFETY

```
User Blocking:
- Bidirectional: If A blocks B, they're mutually blocked
- Unique constraint prevents: (A→B, A→B) duplicates
- CHECK constraint prevents: Self-blocking

Block Checking:
- Before showing price quotes: Check if blocked
- Before notifying about requests: Check if blocked
- Before allowing communication: Check if blocked
- Query: Block.is_blocked(user1_id, user2_id) checks both directions

Dispute-Based Blocking:
- Dispute resolution can include: block_engineer or block_customer
- Creates BLOCK entry via admin action
- Logged in ADMIN_ACTION_LOGS with reason in details_json
```

### 6. NOTIFICATION SYSTEM

```
Notification Types Triggered:
- REQUEST_CREATED: Customer → System creates
- REQUEST_ACCEPTED: Customer ← Engineer accepts request
- REQUEST_COMPLETED: Customer ← Engineer marks complete
- REQUEST_CANCELLED: Customer ← Request cancelled
- REVIEW_RECEIVED: User ← New review on profile
- ACCOUNT_APPROVED: Engineer ← Admin approves account
- ACCOUNT_REJECTED: Engineer ← Admin rejects account
- SUBSCRIPTION_EXPIRING: Engineer ← 7 days before expiry
- GENERAL: Manual/system notifications

Notification Fields:
- title: Short summary (shown in badge)
- body: Detailed message
- reference_id: Links to related request_id/review_id
- read: Boolean for marking as read
- created_at: Sorting for timeline display
```

### 7. ADMIN AUDIT TRAIL

```
Every significant action logged:

User Management:
- APPROVE_ENGINEER, REJECT_ENGINEER
- BLOCK_USER, UNBLOCK_USER, DELETE_USER
- CREATE_ADMIN, RESET_SUBSCRIPTION

Dispute Resolution:
- RESOLVE_DISPUTE, REJECT_DISPUTE, UPDATE_DISPUTE_STATUS

Service Management:
- MODIFY_SERVICE, CREATE_AREA, UPDATE_AREA, DELETE_AREA

Security:
- FORCE_LOGOUT, DISABLE_LOGIN

Data Export:
- EXPORT_ENGINEERS, EXPORT_FINANCE, EXPORT_REQUESTS, EXPORT_USERS

Audit Log Entry Contains:
- admin_id: Who performed action
- action_type: What was done
- target_type/target_id: What was affected
- details_json: Additional context (reason, old/new values)
- ip_address: Source IP
- user_agent: Client browser/device
- created_at: Timestamp for timeline
```

---

## SQL Schema Definition

See following file: `DATABASE_SCHEMA.sql`

---

## Implementation Steps

### Phase 1: Database Creation ✅ (Completed)
```bash
# Database already created
mysql -u root -pYy@102030 -e "SHOW DATABASES LIKE 'Graduation';"
```

### Phase 2: Flask-Migrate Initialization
```bash
cd backend

# Initialize Flask-Migrate if not already done
flask db init

# Create initial migration from existing models
flask db migrate -m "Initial schema"

# Apply migration to database
flask db upgrade
```

### Phase 3: Run Backend Application
```bash
# This will auto-create tables if using create_all()
python run.py

# Or manually create all tables:
# python -c "from app import create_app, db; create_app().app_context().push(); db.create_all(); print('✓ Tables created')"
```

### Phase 4: Seed Initial Data
```bash
# For demo/test data:
python seed_demo.py

# For production seed data:
python seed.py

# For quick seed:
python quick_seed.py
```

### Phase 5: Verify Database Setup
```sql
-- Check all tables
SHOW TABLES;

-- Check table structures
DESCRIBE users;
DESCRIBE engineer_profiles;
DESCRIBE requests;
-- ... etc for all tables

-- Verify relationships
SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_NAME='requests' AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Check indexes
SHOW INDEX FROM requests;
```

---

## Summary of Entities

| Table | Purpose | Row Count (Typical) | Critical? |
|-------|---------|---------------------|-----------|
| users | User accounts | 100-1K | ✓ CORE |
| engineer_profiles | Engineer profiles | 10-100 | ✓ CORE |
| services | Service catalog | 30-50 | ✓ CORE |
| features | Service categories | 7-10 | ✓ CORE |
| requests | Service requests | 1K-10K | ✓ CORE |
| reviews | Ratings/feedback | 500-5K | ✓ CORE |
| transactions | Financial records | 500-5K | ✓ CORE |
| portfolio_items | Engineer portfolios | 100-500 | OPTIONAL |
| blocks | User blocks | 10-100 | SAFETY |
| notifications | User alerts | 1K-10K | EVENT |
| disputes | Complaints | 10-100 | SAFETY |
| areas | Service regions | 20-50 | CONFIG |
| token_blocklist | Revoked tokens | 100-1K | SECURITY |
| admin_action_logs | Audit trail | 100-10K | ✓ AUDIT |

---

## Database Statistics

- **Total Tables**: 14
- **Total Columns**: ~180
- **Total Indexes**: 40+
- **Foreign Keys**: 25+
- **Check Constraints**: 2
- **Unique Constraints**: 8+
- **Estimated Storage** (empty): ~1 MB
- **Estimated Storage** (populated): ~50-200 MB depending on usage

---

## Next Steps

1. ✅ Analyze existing models (COMPLETED)
2. ⏳ Run Flask-Migrate initialization
3. ⏳ Generate and apply migrations
4. ⏳ Run backend to create all tables
5. ⏳ Seed initial data (features, services, areas)
6. ⏳ Run demo seed for test data
7. ⏳ Export backup for download
8. ⏳ Verify all relationships and constraints
9. ⏳ Set up indexes for performance

---

Generated: 2026-04-05
Database: Graduation (MySQL 8.0)
Status: Ready for Migration
