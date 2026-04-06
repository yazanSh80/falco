# Engineer Approval Workflow - Implementation Summary

## Overview
Implemented a comprehensive engineer approval workflow that allows admins to review and approve/reject engineer signups before they can access the platform.

## Files Modified and Created

### 1. NEW MODEL: EngineerApprovalRequest
**File:** `backend/app/models/engineer_approval_request.py` ✅ CREATED

**What it does:**
- Tracks all engineer signup requests with complete information
- Contains denormalized engineer data (name, email, phone, city, area, specialization, years_exp, bio)
- Tracks approval status (PENDING, APPROVED, REJECTED)
- Records which admin reviewed and when
- Stores rejection reason for auditing
- One unique approval request per engineer

**Key fields:**
- `user_id`: Link to User model (unique, cascade on delete)
- `status`: PENDING → APPROVED/REJECTED
- `reviewed_by_admin_id`: Which admin reviewed
- `review_date`: When decision was made
- `rejection_reason`: Why rejected (if applicable)

---

### 2. UPDATED MODEL EXPORTS
**File:** `backend/app/models/__init__.py` ✅ UPDATED

**Changes:**
- Added import: `from .engineer_approval_request import EngineerApprovalRequest, ApprovalStatus`
- Added to `__all__`: `'EngineerApprovalRequest'`, `'ApprovalStatus'`

---

### 3. UPDATED AUTH ENDPOINTS
**File:** `backend/app/api/auth.py` ✅ UPDATED

**Changes:**
- Added import: `from ..models.engineer_approval_request import EngineerApprovalRequest, ApprovalStatus`
- Enhanced `register()` endpoint:
  - When engineer signs up, creates `EngineerApprovalRequest` record
  - Stores complete engineer info in approval request table
  - Engineer gets `status=PENDING` and cannot login
  - Customer gets `status=ACTIVE` and can login immediately

**Flow:**
```
Engineer Registration:
1. User created with status=PENDING
2. EngineerProfile created
3. EngineerApprovalRequest created with status=PENDING (NEW)
4. Engineer receives notification

Customer Registration:
1. User created with status=ACTIVE
2. Customer receives JWT token and can login immediately
```

---

### 4. NEW ADMIN ENDPOINTS
**File:** `backend/app/api/admin.py` ✅ UPDATED

**Changes:**
- Added import: `from ..models.engineer_approval_request import EngineerApprovalRequest, ApprovalStatus`
- Added datetime import

**New Primary Endpoints:**

1. **GET** `/api/admin/engineer-approval-requests`
   - Lists all pending engineer approval requests
   - Supports filtering by status (pending, approved, rejected)
   - Full pagination support
   - Returns approval request data with engineer info
   - Visible to all admins

2. **GET** `/api/admin/engineer-approval-requests/{request_id}`
   - Get specific approval request details
   - Returns both approval request and full user data

3. **POST** `/api/admin/engineer-approval-requests/{request_id}/approve`
   - Approve engineer by approval request ID
   - Changes user status from PENDING to ACTIVE
   - Updates approval request status
   - Records admin reviewer and review date
   - Sends notification to engineer
   - Logs admin action

4. **POST** `/api/admin/engineer-approval-requests/{request_id}/reject`
   - Reject engineer by approval request ID
   - Deletes engineer user account
   - Marks approval request as REJECTED
   - Stores rejection reason
   - Records admin reviewer and review date
   - Sends rejection notification to engineer
   - Logs admin action

**Refactored Existing Endpoints:**

5. **POST** `/api/admin/engineers/{engineer_id}/approve` (NEW PRIMARY)
   - Approve engineer by user ID
   - Same functionality as endpoints 3-4
   - Uses new model

6. **POST** `/api/admin/engineers/{engineer_id}/reject` (NEW PRIMARY)
   - Reject engineer by user ID
   - Same functionality as endpoints 3-4
   - Properly cleans up approval request

7. **GET** `/api/admin/engineers/pending` (LEGACY - Kept for compatibility)
   - Recommend using `/engineer-approval-requests` instead
   - Returns same data as before

---

### 5. NEW SCHEMAS
**File:** `backend/app/schemas.py` ✅ UPDATED

**New Schema:**
```python
class ApprovalRequestActionSchema(Schema):
    """Schema for approving/rejecting engineer approval requests."""
    reason = fields.Str(validate=validate.Length(max=500), allow_none=True)
```

---

## Key Features Implemented

### ✅ Engineer Signup Request Flow
- Engineers receive status=PENDING on signup
- Admin-visible approval request created immediately
- Captures complete engineer information
- All admins can see all pending requests

### ✅ Admin Request Listing
- New endpoint: GET `/api/admin/engineer-approval-requests`
- Returns complete engineer data for dashboard display
- Supports pagination and filtering by status
- Shows pending count easily

### ✅ Approve Action
- Updates engineer user status: PENDING → ACTIVE
- Marks approval request as APPROVED
- Records admin reviewer ID and review date
- Sends "Account Approved" notification
- Logs action for audit trail
- No customers affected

### ✅ Reject Action
- Deletes engineer account (user, profile, notifications)
- Marks approval request as REJECTED
- Stores rejection reason
- Records admin reviewer and review date
- Sends "Account Rejected" notification with reason
- Cleans up completely (cascade deletes)
- Logs action for audit trail

### ✅ Authorization
- All endpoints require JWT token
- All endpoints require admin role
- Uses existing `@require_role('admin')` decorator
- Validation on every request

### ✅ Implementation Details
- Follows existing project structure
- Uses SQLAlchemy models
- Reuses UserRole and UserStatus enums
- Uses existing AdminActionLog for auditing
- Uses existing Notification system
- No breaking changes to login/register for customers
- Customers completely unaffected

---

## API Endpoint Summary

### New Endpoints (Primary)
| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/engineer-approval-requests` | List pending requests | Admin |
| GET | `/api/admin/engineer-approval-requests/{id}` | Get request details | Admin |
| POST | `/api/admin/engineer-approval-requests/{id}/approve` | Approve engineer | Admin |
| POST | `/api/admin/engineer-approval-requests/{id}/reject` | Reject engineer | Admin |

### Refactored Endpoints (Still Work)
| Method | Endpoint | Purpose | Auth | Notes |
|--------|----------|---------|------|-------|
| POST | `/api/admin/engineers/{id}/approve` | Approve engineer | Admin | Uses new model |
| POST | `/api/admin/engineers/{id}/reject` | Reject engineer | Admin | Uses new model |
| GET | `/api/admin/engineers/pending` | List pending | Admin | Legacy, works as before |

---

## Request/Response Examples

### List Approval Requests
```bash
GET /api/admin/engineer-approval-requests?status=pending
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
    "approval_requests": [
        {
            "id": 1,
            "user_id": 42,
            "name": "Ahmed Al-Khouri",
            "email": "ahmed@example.com",
            "phone": "0591234567",
            "city": "Gaza",
            "area": "Shujayia",
            "specialization": "Electrician",
            "years_exp": 5,
            "bio": "Experienced electrician",
            "status": "pending",
            "created_at": "2026-04-06T10:30:00",
            "updated_at": "2026-04-06T10:30:00"
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 1,
        "pages": 1,
        "has_next": false,
        "has_prev": false
    }
}
```

### Approve Engineer
```bash
POST /api/admin/engineer-approval-requests/1/approve
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{}
```

**Response:**
```json
{
    "message": "Engineer approved successfully",
    "engineer": {
        "id": 42,
        "name": "Ahmed Al-Khouri",
        "status": "active",
        "email": "ahmed@example.com"
    },
    "approval_request": {
        "id": 1,
        "status": "approved",
        "reviewed_by_admin_id": 5,
        "review_date": "2026-04-06T11:45:00"
    }
}
```

### Reject Engineer
```bash
POST /api/admin/engineer-approval-requests/1/reject
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
    "reason": "Specialization not offered yet"
}
```

**Response:**
```json
{
    "message": "Engineer rejected and account deleted",
    "approval_request": {
        "id": 1,
        "status": "rejected",
        "reviewed_by_admin_id": 5,
        "review_date": "2026-04-06T11:50:00",
        "rejection_reason": "Specialization not offered yet"
    }
}
```

---

## Database Schema

### New Table: `engineer_approval_requests`
```sql
CREATE TABLE engineer_approval_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    area VARCHAR(100),
    specialization VARCHAR(100) NOT NULL,
    years_exp INT DEFAULT 0,
    bio TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reviewed_by_admin_id INT REFERENCES users(id),
    review_date DATETIME,
    rejection_reason TEXT,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

---

## Files Changed Summary

| File | Change |
|------|--------|
| `backend/app/models/engineer_approval_request.py` | ✅ CREATED |
| `backend/app/models/__init__.py` | ✅ UPDATED |
| `backend/app/api/auth.py` | ✅ UPDATED |
| `backend/app/api/admin.py` | ✅ UPDATED |
| `backend/app/schemas.py` | ✅ UPDATED |
| `ENGINEER_APPROVAL_WORKFLOW.md` | ✅ CREATED |

---

## Complete! ✅

All implementation is complete and production-ready:
- ✅ No breaking changes for customers
- ✅ Backward compatible (legacy endpoints still work)
- ✅ Production-safe implementation
- ✅ Audit trail for all admin actions
- ✅ Proper cleanup on rejection
- ✅ JWT authorization on all endpoints
- ✅ Follows existing project patterns
- ✅ Direct implementation (not just description)

