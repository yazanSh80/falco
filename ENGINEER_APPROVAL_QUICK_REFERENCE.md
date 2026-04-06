# Engineer Approval - Quick Reference Guide

## Quick Start for Admins

### 1. View All Pending Engineers

```bash
curl -X GET "http://localhost:5000/api/admin/engineer-approval-requests?status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Response shows:**
- Engineer name, email, phone
- Specialization, years of experience, bio
- City/area
- When they applied
- Created timestamp

---

### 2. View Specific Engineer Details

```bash
curl -X GET "http://localhost:5000/api/admin/engineer-approval-requests/1" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

Returns full details of engineer + their user profile.

---

### 3. Approve an Engineer

```bash
curl -X POST "http://localhost:5000/api/admin/engineer-approval-requests/1/approve" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}"
```

**What happens:**
- Engineer status changed to `active`
- Engineer receives email notification
- Engineer can now login
- Approval recorded with timestamp
- Admin action logged

---

### 4. Reject an Engineer (with reason)

```bash
curl -X POST "http://localhost:5000/api/admin/engineer-approval-requests/1/reject" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "No Plumbing services in our current portfolio"}'
```

**What happens:**
- Engineer account deleted
- Engineer profile deleted
- Engineer receives rejection email with reason
- Rejection recorded with timestamp
- Admin action logged

---

## Alternative (By User ID)

If you have the user ID instead of approval request ID:

### Approve
```bash
curl -X POST "http://localhost:5000/api/admin/engineers/{user_id}/approve" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{}"
```

### Reject
```bash
curl -X POST "http://localhost:5000/api/admin/engineers/{user_id}/reject" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Reason here"}'
```

---

## Data Available for Review

When listing approval requests, admins see:

```
{
    "id": 1,                          // Approval request ID
    "user_id": 42,                    // Engineer user ID
    "name": "Ahmed Al-Khouri",        // Engineer name
    "email": "ahmed@example.com",     // Email
    "phone": "0591234567",            // Phone
    "city": "Gaza",                   // City
    "area": "Shujayia",               // Area
    "specialization": "Electrician",  // What they do
    "years_exp": 5,                   // Years experience
    "bio": "Experienced in...",       // About them
    "status": "pending",              // Status
    "created_at": "2026-04-06T..."    // When they applied
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success ✓ |
| 400 | Bad request or already processed |
| 401 | Unauthorized (invalid JWT) |
| 403 | Forbidden (not admin) |
| 404 | Not found (invalid ID) |

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Approval request not found" | Invalid request ID | Check the ID |
| "Approval request is not pending" | Already approved/rejected | Can't process twice |
| "Access denied. Required role: admin" | Not an admin | Use admin account |
| "User not found" | User was deleted | Check user ID |

---

## Common Workflows

### Daily Admin Review

1. GET `/api/admin/engineer-approval-requests?status=pending` → See all pending
2. For each engineer:
   - GET `/api/admin/engineer-approval-requests/{id}` → Review details
   - POST `.../approve` or `.../reject` → Make decision
3. Done!

### Mass Approval

```bash
# Get IDs of first 20 pending engineers
GET /api/admin/engineer-approval-requests?status=pending&per_page=20

# For each ID, approve:
POST /api/admin/engineer-approval-requests/{id}/approve
```

### Check Rejections

```bash
# See all rejected applications
GET /api/admin/engineer-approval-requests?status=rejected
```

---

## FAQ

**Q: Can an engineer appeal after rejection?**
A: No, they must re-register with a new account.

**Q: Do customers need approval?**
A: No, customers are active immediately.

**Q: Can an engineer login while pending?**
A: No, they must wait for approval first.

**Q: What gets deleted when rejected?**
A: User account, profile, notifications (not the approval request record - kept for audit).

**Q: Can I undo an approval?**
A: No, once approved, it's final. You can block the account instead via `/api/admin/users/{id}/block`.

**Q: Do all admins see all requests?**
A: Yes, all admins see all pending requests.

**Q: Is there a reason required for rejection?**
A: No, reason is optional but recommended.

---

## Implementation Files

- Model: `backend/app/models/engineer_approval_request.py`
- Auth: `backend/app/api/auth.py` (register endpoint)
- Admin: `backend/app/api/admin.py` (new endpoints)
- Schemas: `backend/app/schemas.py`

For complete API docs, see: `ENGINEER_APPROVAL_WORKFLOW.md`

