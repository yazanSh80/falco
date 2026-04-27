# Engineer Approval Workflow - API Documentation

## Overview

The engineer approval workflow allows admins to manage pending engineer signups. When an engineer registers, their account is created with `status=pending` and an approval request is created for admins to review.

## Database Tables

### 1. `engineer_approval_requests` (NEW)

Tracks all engineer signup requests visible to all admins.

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
    rejection_reason TEXT
);
```

### 2. Existing Tables (Updated)

- `users`: Engineers created with `status='pending'`
- `engineer_profiles`: Created when engineer registers
- `notifications`: Admin actions trigger notifications to engineer

## API Endpoints

### 1. List Engineer Approval Requests (NEW PRIMARY ENDPOINT)

**GET** `/api/admin/engineer-approval-requests`

Lists all pending engineer approval requests visible to all admins.

**Authentication:** Requires JWT token; Admin role only

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `approved`, `rejected`). Defaults to `pending`.
- `page` (optional): Page number for pagination. Default: 1
- `per_page` (optional): Items per page. Default: 20

**Response (200 OK):**
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
            "bio": "Experienced electrician with 5 years of market knowledge",
            "status": "pending",
            "created_at": "2026-04-06T10:30:00",
            "updated_at": "2026-04-06T10:30:00",
            "reviewed_by_admin_id": null,
            "review_date": null,
            "rejection_reason": null
        }
    ],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 15,
        "pages": 1,
        "has_next": false,
        "has_prev": false
    }
}
```

---

### 2. Get Specific Approval Request

**GET** `/api/admin/engineer-approval-requests/{request_id}`

Get detailed information about a specific approval request including full user data.

**Authentication:** Requires JWT token; Admin role only

**Response (200 OK):**
```json
{
    "approval_request": {
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
        "updated_at": "2026-04-06T10:30:00",
        "reviewed_by_admin_id": null,
        "review_date": null,
        "rejection_reason": null
    },
    "user": {
        "id": 42,
        "name": "Ahmed Al-Khouri",
        "email": "ahmed@example.com",
        "phone": "0591234567",
        "role": "engineer",
        "status": "pending",
        "city": "Gaza",
        "area": "Shujayia",
        "created_at": "2026-04-06T10:30:00",
        "profile": {
            "user_id": 42,
            "specialization": "Electrician",
            "years_exp": 5,
            "bio": "Experienced electrician",
            "rating_avg": 0,
            "rating_count": 0,
            "subscription_status": "active",
            "is_subscription_active": true
        }
    }
}
```

**Error Response (404 Not Found):**
```json
{
    "error": "Approval request not found"
}
```

---

### 3. Approve Engineer (PRIMARY ENDPOINT)

**POST** `/api/admin/engineer-approval-requests/{request_id}/approve`

Approve an engineer's registration using the approval request ID.

**Authentication:** Requires JWT token; Admin role only

**Request Body:** Empty or {}

**Response (200 OK):**
```json
{
    "message": "Engineer approved successfully",
    "engineer": {
        "id": 42,
        "name": "Ahmed Al-Khouri",
        "email": "ahmed@example.com",
        "phone": "0591234567",
        "role": "engineer",
        "status": "active",
        "city": "Gaza",
        "area": "Shujayia",
        "created_at": "2026-04-06T10:30:00",
        "profile": {
            "user_id": 42,
            "specialization": "Electrician",
            "years_exp": 5,
            "bio": "Experienced electrician",
            "rating_avg": 0,
            "rating_count": 0,
            "subscription_status": "active",
            "is_subscription_active": true
        }
    },
    "approval_request": {
        "id": 1,
        "user_id": 42,
        "status": "approved",
        "reviewed_by_admin_id": 5,
        "review_date": "2026-04-06T11:45:00",
        "rejection_reason": null
    }
}
```

**Error Response (404 Not Found):**
```json
{
    "error": "Approval request not found"
}
```

**Error Response (400 Bad Request - Already Processed):**
```json
{
    "error": "Approval request is not pending"
}
```

---

### 4. Reject Engineer (PRIMARY ENDPOINT)

**POST** `/api/admin/engineer-approval-requests/{request_id}/reject`

Reject an engineer's registration and delete their account.

**Authentication:** Requires JWT token; Admin role only

**Request Body:**
```json
{
    "reason": "Experience too limited for this role"
}
```

**Response (200 OK):**
```json
{
    "message": "Engineer rejected and account deleted",
    "approval_request": {
        "id": 1,
        "user_id": 42,
        "status": "rejected",
        "reviewed_by_admin_id": 5,
        "review_date": "2026-04-06T11:50:00",
        "rejection_reason": "Experience too limited for this role"
    }
}
```

**Error Response (404 Not Found):**
```json
{
    "error": "Approval request not found"
}
```

**Error Response (400 Bad Request - Already Processed):**
```json
{
    "error": "Approval request is not pending"
}
```

---

### 5. Approve Engineer by User ID (LEGACY)

**POST** `/api/admin/engineers/{engineer_id}/approve`

Approve an engineer's registration using the user ID.

**Authentication:** Requires JWT token; Admin role only

**Response:** Same as `/engineer-approval-requests/{request_id}/approve`

---

### 6. Reject Engineer by User ID (LEGACY)

**POST** `/api/admin/engineers/{engineer_id}/reject`

Reject an engineer's registration using the user ID.

**Authentication:** Requires JWT token; Admin role only

**Request Body:**
```json
{
    "reason": "Reason for rejection"
}
```

**Response:** Same as `/engineer-approval-requests/{request_id}/reject`

---

### 7. List Pending Engineers (LEGACY)

**GET** `/api/admin/engineers/pending`

Legacy endpoint to list pending engineers. 

**Recommendation:** Use `/api/admin/engineer-approval-requests` instead (has better pagination and filtering).

**Response (200 OK):**
```json
{
    "pending_engineers": [
        {
            "id": 42,
            "name": "Ahmed Al-Khouri",
            "email": "ahmed@example.com",
            "phone": "0591234567",
            "role": "engineer",
            "status": "pending",
            "city": "Gaza",
            "area": "Shujayia",
            "created_at": "2026-04-06T10:30:00",
            "profile": {
                "user_id": 42,
                "specialization": "Electrician",
                "years_exp": 5,
                "bio": "Experienced electrician",
                "rating_avg": 0,
                "rating_count": 0,
                "subscription_status": "active",
                "is_subscription_active": true
            }
        }
    ],
    "count": 1
}
```

---

## Workflow Examples

### Complete Flow: Engineer Registration to Approval

#### Step 1: Engineer Signs Up

**POST** `/api/auth/register`

```json
{
    "name": "Ahmed Al-Khouri",
    "email": "ahmed@example.com",
    "password": "SecurePass123",
    "role": "engineer",
    "phone": "0591234567",
    "city": "Gaza",
    "area": "Shujayia",
    "specialization": "Electrician",
    "years_exp": 5,
    "bio": "Experienced electrician with 5 years of market knowledge"
}
```

**Response (201 Created):**
```json
{
    "message": "Registration successful. Your account is pending admin approval.",
    "user": {
        "id": 42,
        "name": "Ahmed Al-Khouri",
        "email": "ahmed@example.com",
        "phone": "0591234567",
        "role": "engineer",
        "status": "pending",
        "city": "Gaza",
        "area": "Shujayia",
        "created_at": "2026-04-06T10:30:00",
        "verification_status": "pending",
        "profile": {
            "user_id": 42,
            "specialization": "Electrician",
            "years_exp": 5,
            "bio": "Experienced electrician with 5 years of market knowledge",
            "rating_avg": 0,
            "rating_count": 0,
            "subscription_status": "active",
            "subscription_expiry": "2026-05-06",
            "is_subscription_active": true
        }
    }
}
```

**What happens:**
- User created with `status='pending'`
- EngineerProfile created
- EngineerApprovalRequest created with `status='pending'`
- Notification added to engineer (not yet approved)

#### Step 2: Admin Views All Pending Requests

**GET** `/api/admin/engineer-approval-requests?status=pending`

With admin JWT token in Authorization header.

Admin dashboard displays all 15 pending engineers.

#### Step 3: Admin Reviews Specific Request

**GET** `/api/admin/engineer-approval-requests/1`

Admin can see full details of engineer and approval request.

#### Step 4: Admin Approves the Engineer

**POST** `/api/admin/engineer-approval-requests/1/approve`

Empty request body or `{}`

**Effects:**
- User status changed to `active`
- ApprovalRequest status changed to `approved`
- Notification sent to engineer: "Account Approved"
- Admin action logged

#### Step 5: Engineer Can Now Accept Jobs

Engineer can now login and start accepting service requests, as `status='active'`.

---

### Rejection Flow

#### Step 1-3: Same as above

#### Step 4: Admin Rejects the Engineer

**POST** `/api/admin/engineer-approval-requests/1/reject`

```json
{
    "reason": "Specialization not listed in our services yet"
}
```

**Effects:**
- User account deleted (and cascade deletes profile, notifications, etc.)
- ApprovalRequest status changed to `rejected`
- rejection_reason stored
- Notification sent to engineer: "Account Rejected"
- Admin action logged

#### Step 5: Engineer Cannot Login

Email is now freed up for reuse, and engineer is removed from the system.

---

## Database Migration

If upgrading from previous version without `engineer_approval_requests` table, run:

```sql
CREATE TABLE engineer_approval_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
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
    reviewed_by_admin_id INT,
    review_date DATETIME,
    rejection_reason TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Create approval requests for existing pending engineers
INSERT INTO engineer_approval_requests 
    (user_id, name, email, phone, city, area, specialization, years_exp, bio, status, created_at)
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.city,
    u.area,
    ep.specialization,
    ep.years_exp,
    ep.bio,
    'pending',
    u.created_at
FROM users u
LEFT JOIN engineer_profiles ep ON u.id = ep.user_id
WHERE u.role = 'engineer' AND u.status = 'pending';
```

---

## Key Features

### For Admins:
- ✅ View all pending engineer requests in one place
- ✅ See complete engineer information (name, email, phone, specialization, experience, bio, location)
- ✅ Approve or reject with optional reason
- ✅ Track who reviewed and when
- ✅ View approved/rejected history

### For Engineers:
- ✅ Account created with `status='pending'` on signup
- ✅ Cannot login until approved
- ✅ Receive notification on approval or rejection
- ✅ 30-day free subscription trial upon approval

### For Customers:
- ✅ No changes - unaffected
- ✅ Customer signups remain instantaneous with `status='active'`

### For System:
- ✅ Audit trail via AdminActionLog
- ✅ Notifications for all actions
- ✅ Cascade deletion cleanup
- ✅ All admins see all pending requests

---

## Error Handling

| Status | Error | Reason |
|--------|-------|--------|
| 400 | "Approval request is not pending" | Already approved/rejected |
| 400 | "User is not an engineer" | User not found or wrong role |
| 403 | "Access denied. Required role: admin" | Non-admin trying to access |
| 404 | "Approval request not found" | Invalid request ID |
| 404 | "User not found" | Invalid user/engineer ID |
| 401 | Unauthorized | Missing/invalid JWT token |

---

## Implementation Notes

1. **No customer impact**: Customers still register with `status='active'` and get immediate login.

2. **Approval request lifetime**: Linked to engineer. On engineer deletion (rejection), approval request is updated with rejection details but kept for audit.

3. **Cascade cleanup**: When engineer is rejected and deleted:
   - User account deleted
   - EngineerProfile deleted (cascade)
   - Related notifications deleted (cascade)
   - ApprovalRequest NOT deleted (marked `rejected` for audit)

4. **Admin visibility**: All admins see all pending requests. No admin-specific filtering.

5. **Subscription trial**: Approved engineers get 30-day trial subscription automatically.

6. **JWT authorization**: All endpoints require valid JWT token with admin role.

---

