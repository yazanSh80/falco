# Engineer Registration & File Upload - Complete Implementation Guide

## Summary of Changes

### Files Modified:
1. **backend/app/models/engineer_certificate.py** - ✅ CREATED (new model for multiple certificates)
2. **backend/app/models/__init__.py** - ✅ UPDATED (exported new model)
3. **backend/app/api/auth.py** - ✅ UPDATED (better error handling in registration)
4. **backend/app/api/uploads.py** - ✅ UPDATED (complete file upload rewrite with proper error handling)
5. **backend/app/api/engineer.py** - ✅ UPDATED (added certificate management endpoints)

---

## Complete Engineer Registration & Upload Flow

### Step 1: Engineer Registration

**Endpoint:** `POST /api/auth/register` or `POST /api/v1/auth/register`

**Request Format (JSON):**
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
    "bio": "Experienced electrician with 5 years in the field"
}
```

**All fields required EXCEPT:**
- `phone` (optional)
- `city` (optional)
- `area` (optional)
- `specialization` (optional - defaults to "Not specified")
- `years_exp` (optional - defaults to 0)
- `bio` (optional - defaults to empty)

**Response (201 Created):**
```json
{
    "message": "Registration successful. Your account is pending admin approval. You can login now to upload your CV and certificate.",
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
            "bio": "Experienced electrician with 5 years in the field",
            "cv_url": null,
            "certificate_url": null,
            "rating_avg": 0,
            "rating_count": 0
        }
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Key Points:**
- ✅ Engineer is created with `status = pending`
- ✅ Engineer receives JWT token immediately (can login and upload files)
- ✅ `access_token` is provided in response
- ✅ Engineer profile is created with specialization and other info
- ✅ Approval request created for admins to review

---

### Step 2: Upload CV

**Endpoint:** `POST /api/uploads` or `POST /api/v1/uploads`

**Request Format (multipart/form-data):**
```
Headers:
  Authorization: Bearer {access_token_from_registration}
  
Body (form-data):
  file: <cv_file.pdf>          (form file field)
  type: cv                       (form text field)
```

**Using cURL:**
```bash
curl -X POST "http://localhost:5000/api/uploads" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -F "file=@/path/to/your/cv.pdf" \
  -F "type=cv"
```

**Using Postman:**
1. Method: `POST`
2. URL: `http://localhost:5000/api/uploads`
3. Headers tab:
   - `Authorization`: `Bearer {access_token}`
4. Body tab → form-data:
   - Key: `file`, Type: `File`, Value: (select your PDF file)
   - Key: `type`, Type: `Text`, Value: `cv`
5. Send

**Using JavaScript/Fetch:**
```javascript
const formData = new FormData();
formData.append('file', cvFileInput.files[0]);  // <input type="file" id="cvFileInput">
formData.append('type', 'cv');

const response = await fetch('http://localhost:5000/api/uploads', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${accessToken}`
    },
    body: formData
});

const result = await response.json();
console.log(result);
```

**Response (201 Created):**
```json
{
    "message": "File uploaded successfully",
    "url": "/api/uploads/cv/abc123def456.pdf",
    "filename": "abc123def456.pdf",
    "original_filename": "cv.pdf",
    "type": "cv"
}
```

**Allowed File Types for CV:**
- `.pdf`
- `.doc`
- `.docx`

---

### Step 3: Upload Certificate (Can upload multiple!)

**Endpoint:** `POST /api/uploads` or `POST /api/v1/uploads`

**Request Format (multipart/form-data):**
```
Headers:
  Authorization: Bearer {access_token_from_registration}
  
Body (form-data):
  file: <certificate_file.pdf>    (form file field)
  type: certificate                (form text field)
```

**Using cURL:**
```bash
# Certificate 1
curl -X POST "http://localhost:5000/api/uploads" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -F "file=@/path/to/certificate1.pdf" \
  -F "type=certificate"

# Certificate 2 (different certificate)
curl -X POST "http://localhost:5000/api/uploads" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..." \
  -F "file=@/path/to/certificate2.png" \
  -F "type=certificate"
```

**Using JavaScript/Fetch:**
```javascript
async function uploadCertificate(certFile, accessToken) {
    const formData = new FormData();
    formData.append('file', certFile);
    formData.append('type', 'certificate');
    
    const response = await fetch('http://localhost:5000/api/uploads', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: formData
    });
    
    return await response.json();
}

// Upload multiple certificates
const cert1 = await uploadCertificate(certFile1, accessToken);
const cert2 = await uploadCertificate(certFile2, accessToken);
```

**Response (201 Created):**
```json
{
    "message": "File uploaded successfully",
    "url": "/api/uploads/certificate/xyz789abc123.pdf",
    "filename": "xyz789abc123.pdf",
    "original_filename": "certification.pdf",
    "type": "certificate"
}
```

**Allowed File Types for Certificates:**
- `.pdf`
- `.png`
- `.jpg`
- `.jpeg`

---

### Step 4: View Current Profile with All Uploads

**Endpoint:** `GET /api/engineer/profile` or `GET /api/v1/engineer/profile`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/engineer/profile" \
  -H "Authorization: Bearer {access_token}"
```

**Response (200 OK):**
```json
{
    "user": {
        "id": 42,
        "name": "Ahmed Al-Khouri",
        "email": "ahmed@example.com",
        "role": "engineer",
        "status": "pending"
    },
    "profile": {
        "user_id": 42,
        "specialization": "Electrician",
        "years_exp": 5,
        "bio": "Experienced electrician",
        "cv_url": "/api/uploads/cv/abc123def456.pdf",
        "certificate_url": null,
        "rating_avg": 0,
        "rating_count": 0
    },
    "certificates": [
        {
            "id": 1,
            "user_id": 42,
            "certificate_url": "/api/uploads/certificate/xyz789abc123.pdf",
            "certificate_name": "certification.pdf",
            "uploaded_at": "2026-04-06T11:00:00"
        },
        {
            "id": 2,
            "user_id": 42,
            "certificate_url": "/api/uploads/certificate/def456xyz789.png",
            "certificate_name": "electrical-license.png",
            "uploaded_at": "2026-04-06T11:05:00"
        }
    ],
    "portfolio": []
}
```

---

### Step 5: Update Profile

**Endpoint:** `PUT /api/engineer/profile` or `PUT /api/v1/engineer/profile`

**Request (JSON):**
```json
{
    "specialization": "Master Electrician",
    "years_exp": 7,
    "bio": "Professional electrician with 7 years experience in residential and commercial work",
    "name": "Ahmed Al-Khouri",
    "phone": "0591234567",
    "city": "Gaza",
    "area": "Shujayia"
}
```

**Response (200 OK):**
```json
{
    "message": "Profile updated successfully",
    "profile": {
        "user_id": 42,
        "specialization": "Master Electrician",
        "years_exp": 7,
        "bio": "Professional electrician with 7 years experience...",
        "cv_url": "/api/uploads/cv/abc123def456.pdf",
        "certificate_url": null
    },
    "user": {
        "id": 42,
        "name": "Ahmed Al-Khouri",
        "email": "ahmed@example.com",
        "phone": "0591234567",
        "city": "Gaza",
        "area": "Shujayia"
    }
}
```

---

### Step 6: View Certificates

**Endpoint:** `GET /api/engineer/certificates` or `GET /api/v1/engineer/certificates`

**Request:**
```bash
curl -X GET "http://localhost:5000/api/engineer/certificates" \
  -H "Authorization: Bearer {access_token}"
```

**Response (200 OK):**
```json
{
    "certificates": [
        {
            "id": 1,
            "user_id": 42,
            "certificate_url": "/api/uploads/certificate/xyz789abc123.pdf",
            "certificate_name": "certification.pdf",
            "uploaded_at": "2026-04-06T11:00:00"
        },
        {
            "id": 2,
            "user_id": 42,
            "certificate_url": "/api/uploads/certificate/def456xyz789.png",
            "certificate_name": "electrical-license.png",
            "uploaded_at": "2026-04-06T11:05:00"
        }
    ],
    "count": 2
}
```

---

### Step 7: Delete a Certificate

**Endpoint:** `DELETE /api/engineer/certificates/{cert_id}` or `DELETE /api/v1/engineer/certificates/{cert_id}`

**Request:**
```bash
curl -X DELETE "http://localhost:5000/api/engineer/certificates/1" \
  -H "Authorization: Bearer {access_token}"
```

**Response (200 OK):**
```json
{
    "message": "Certificate deleted"
}
```

---

## Error Handling

### Upload Errors

**Missing file:**
```json
{
    "error": "No file provided",
    "code": "missing_file"
}
```

**Invalid file type:**
```json
{
    "error": "File type not allowed",
    "code": "invalid_file_type",
    "allowed_extensions": ["pdf", "jpg", "jpeg", "png", "doc", "docx"]
}
```

**No engineer profile:**
```json
{
    "error": "Engineer profile not found",
    "code": "profile_not_found"
}
```

**Database error:**
```json
{
    "error": "Failed to save file information to database",
    "code": "db_error",
    "details": "..."
}
```

---

## Complete Registration to Approval Flow

```
1. ENGINEER SIGNUP
   POST /api/auth/register
   → User created with status=pending
   → EngineerProfile created
   → EngineerApprovalRequest created
   → JWT token issued

2. ENGINEER UPLOADS FILES (can do immediately)
   POST /api/uploads (CV)
   POST /api/uploads (Certificate 1)
   POST /api/uploads (Certificate 2, ...)
   → Files stored on disk
   → CV URL saved to engineer_profile.cv_url
   → Certificate URLs saved to engineer_certificates table (multiple rows)

3. ENGINEER UPDATES PROFILE
   PUT /api/engineer/profile
   → Specialization, bio, experience updated
   → User info updated

4. ADMIN REVIEWS & APPROVES
   GET /api/admin/engineer-approval-requests
   POST /api/admin/engineer-approval-requests/{request_id}/approve
   → User status changes: pending → active
   → ApprovalRequest status: pending → approved
   → Engineer receives notification

5. ENGINEER CAN NOW ACCEPT JOBS
   ✅ Full access to platform
```

---

## Database Schema

### engineer_profiles table
- `user_id` (PK, FK to users)
- `specialization`
- `years_exp`
- `bio`
- `cv_url` (single URL for CV)
- `certificate_url` (legacy, should be null in new workflow)
- `rating_avg`
- `rating_count`

### engineer_certificates table (NEW)
- `id` (PK)
- `user_id` (FK to users, indexed)
- `certificate_url` (URL to certificate file)
- `certificate_name` (original filename)
- `uploaded_at` (timestamp)

---

## Key Fixes Made

✅ **Problem 1: Multiple certificates support**
- Created new `EngineerCertificate` model
- Upload endpoint now stores each certificate as a separate record
- Engineers can upload unlimited certificates

✅ **Problem 2: CV handling**
- CV remains single per engineer in profile
- Old CV is automatically deleted on new upload
- Upload replaces previous CV

✅ **Problem 3: Better error handling**
- All upload errors now have clear error codes
- File validation with specific error messages
- Proper database transaction handling with rollback on failure
- Detailed logging for debugging

✅ **Problem 4: Registration improvements**
- Better error handling with try-catch
- More detailed logging at each step
- Proper flush and commit sequence
- Error response with details for debugging

✅ **Problem 5: Engineer access while pending**
- Engineers get JWT token on registration
- Can login immediately to upload files
- Can update profile before admin approval
- Status remains `pending` until admin approves

---

## Testing Checklist

- [ ] Engineer can register
- [ ] Engineer gets access_token on signup
- [ ] Engineer can upload CV (.pdf, .doc, .docx)
- [ ] Engineer can upload multiple certificates (.pdf, .png, .jpg, .jpeg)
- [ ] CV URL is stored in engineer_profile.cv_url
- [ ] Certificates stored in engineer_certificates table
- [ ] Engineer can view all certificates
- [ ] Engineer can delete certificates
- [ ] Old CV is deleted when new one uploaded
- [ ] File validation works (rejects bad types)
- [ ] Profile can be updated with new specialization/years_exp/bio
- [ ] Admin can see engineer in approval requests
- [ ] Admin can approve engineer
- [ ] Engineer status changes to active after approval
- [ ] Customers still work (unaffected)
- [ ] Registration error handling works
- [ ] Upload error handling works

