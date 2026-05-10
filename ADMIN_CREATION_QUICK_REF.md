# Admin Creation - Quick Reference

## Endpoint

```
POST /api/v1/admin/admins
```

Authentication: **JWT Token (Admin Role)**

## Request

```json
{
  "name": "New Admin Name",
  "email": "admin@example.com",
  "password": "SecurePassword123",
  "phone": "0591234567"
}
```

## Response (Success - 201)

```json
{
  "message": "Admin created successfully",
  "user": {
    "id": 47,
    "name": "New Admin Name",
    "email": "admin@example.com",
    "role": "admin",
    "status": "active"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Key Points

- ✅ New admin immediately saved to database
- ✅ Access token provided for instant login
- ✅ Only admins can create other admins
- ✅ Email must be unique
- ✅ Password automatically hashed
- ✅ Admin action logged to audit trail
- ✅ No breaking changes to existing flows

## Error Codes

| Code | Reason |
|------|--------|
| 201 | Admin created successfully |
| 400 | Validation failed (invalid email, missing field, etc) |
| 401 | Missing or invalid JWT token |
| 403 | User is not admin |
| 409 | Email already exists |
| 500 | Server error |

## Code Changes

**Modified File:** `backend/app/api/admin.py`
- Added `create_access_token` import
- Added `current_app` import  
- Enhanced `create_admin()` endpoint with error handling, logging, and JWT token generation

## Testing Status

✅ All 7 tests passing:
1. Admin login
2. Create new admin (201)
3. Token verification
4. Duplicate email rejection (409)
5. Missing fields rejection (400)
6. Missing auth rejection (401)
7. Non-admin rejection (403)

## Usage

```bash
# Login as existing admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'

# Create new admin
curl -X POST http://localhost:5000/api/v1/admin/admins \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "Password123"
  }'
```

---

**Status: ✅ READY FOR PRODUCTION**
