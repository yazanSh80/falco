# Dual Authentication - Quick Reference

## Login Endpoint

**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "UserPassword123"
}
```

**Response (Success)**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "customer|engineer|admin",
    "status": "active|pending|blocked",
    "verification_status": "approved|pending|null",
    "city": "City",
    "area": "Area"
  },
  "demo_account": false  // true if demo fallback used
}
```

**Response (Failure)**:
```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Invalid email or password"
}
```

## Signup Endpoint

**Endpoint**: `POST /api/auth/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "customer|engineer",
  "phone": "0591234567",
  "city": "Gaza",
  "area": "Shujayia",
  "specialization": "Electrician",  // engineer only
  "years_exp": 5,  // engineer only
  "bio": "Professional electrician"  // engineer only
}
```

**Response**:
```json
{
  "message": "Registration successful",
  "user": {
    "id": 2,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "customer|engineer",
    ...
  },
  "access_token": "..."
}
```

## Demo Accounts

### Quick Login Testing

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@test.com` | `Pass123!` |
| Engineer (Approved) | `engineer@test.com` | `Pass123!` |
| Engineer (Pending) | `engineer.pending@test.com` | `Pass123!` |
| Admin | `admin@test.com` | `Pass123!` |
| Admin (Alt) | `admin@falco.local` | `Admin@12345` |
| Super Admin | `ahmadsaqer818@gmail.com` | `saqer123` |

All demo accounts exist in both:
- **demo_database** (config fallback)
- **real_database** (seeded after running seed_demo.py)

## Authentication Modes

### Mode 1: Demo/Development (DEMO_MODE=true)

Frontend uses hardcoded mock data:
```javascript
const mockUsers = [
  { email: 'customer@test.com', password: 'Pass123!', role: 'customer', ... },
  { email: 'engineer@test.com', password: 'Pass123!', role: 'engineer', ... },
  { email: 'admin@test.com', password: 'Pass123!', role: 'admin', ... },
];
```

No API calls. Data not persisted.

### Mode 2: Live/Production (DEMO_MODE=false)

Frontend calls real API:
```javascript
POST /api/auth/login
  → Backend checks database (real users)
  → If not found, checks demo accounts fallback
  → Returns JWT token or 401
```

Data persisted to database.

## Password Hashing

### Database Users
```python
# Creation
user.set_password('UserPassword123')  # Hashes with PBKDF2SHA256
user.password_hash  # Stores: pbkdf2:sha256:260000$...$...

# Verification
user.check_password('UserPassword123')  # Returns True
user.check_password('WrongPassword')     # Returns False
```

### Demo Users
```json
{
  "email": "demo@test.com",
  "password": "Pass123!"  // Plaintext in config (for demo only)
}
```

Demo passwords are simple because they're for development. In production, real database users have strong password requirements.

## Authentication Flow

```
STEP 1: User logs in with email + password
        ↓
STEP 2: Backend /api/auth/login receives request
        ↓
STEP 3: PATH 1 - Check Database User
        SELECT * FROM users WHERE email = '...'
        IF found AND password hash matches
        RETURN JWT tokens → DONE ✅
        ELSE → Continue to PATH 2
        ↓
STEP 4: PATH 2 - Check Demo Fallback
        IF email in DEMO_ACCOUNTS
        AND password matches demo config
        RETURN JWT tokens (with demo_account flag) → DONE ✅
        ELSE → Continue to STEP 5
        ↓
STEP 5: Authentication Failed
        RETURN 401 Unauthorized ❌
```

## Backend Implementation

### Login Endpoint Structure

```python
@bp.route('/login', methods=['POST'])
def login():
    # Get email and password from request
    email = validated_data['email'].lower()
    password = validated_data['password']
    
    # PATH 1: Try database user
    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        # Check status (blocked/pending)
        # Generate JWT tokens
        return jwt_tokens, 200
    
    # PATH 2: Try demo account
    demo_accounts = current_app.config.get('DEMO_ACCOUNTS', {})
    if email in demo_accounts:
        if demo_accounts[email]['password'] == password:
            # Generate JWT tokens (temporary user object)
            return jwt_tokens_with_demo_flag, 200
    
    # Both paths failed
    return 401_unauthorized, 401
```

## Frontend Implementation

### DataContext Login Function

```typescript
const login = async (email: string, password: string) => {
  if (!isApiAvailable) {
    // DEMO_MODE: Use mock data
    const user = mockUsers.find(u => 
      u.email === email && u.password === password
    );
    if (user) {
      setCurrentUser(user);
      return { success: true, user };
    }
    return { success: false, error: 'Invalid credentials' };
  }
  
  try {
    // LIVE_MODE: Call real API
    const { user } = await authApi.login(email, password);
    setCurrentUser(user);
    return { success: true, user };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
```

## Environment Configuration

### .env File

```env
# Vite needs VITE_ prefix for frontend env vars
VITE_DEMO_MODE=false
VITE_API_URL=http://localhost:5000

# Backend uses unprefixed vars
DEMO_MODE=false
DATABASE_URL=mysql+pymysql://user:pass@localhost:3306/db
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRES=3600
```

**Important**: After changing `.env`, restart your dev server!

## Testing Commands

```bash
# Seed database with demo accounts
python backend/seed_demo.py

# Test dual authentication
python backend/test_dual_auth.py

# Test password hashing
python backend/test_password_hashing.py

# Login via API (bash)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "Pass123!"
  }'

# Signup via API (bash)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "SecurePass123",
    "role": "customer",
    "city": "Gaza",
    "area": "Shujayia"
  }'
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid credentials" for demo account | Check exact email/password match (case-sensitive) |
| Demo account works but DB user doesn't | Run `seed_demo.py` to create demo users in DB |
| New signup not working | Check `VITE_DEMO_MODE=false` in .env, restart Vite |
| Frontend shows DEMO MODE but API exists | Restart Vite dev server (reads .env on startup) |
| Password hash looks wrong | Normal! Werkzeug PBKDF2SHA256 hashes look like: `pbkdf2:sha256:260000$...` |
| Lost access to demo accounts | They're always available as fallback, no database needed |

## Security Best Practices

✅ **DO:**
- Use strong passwords for real database users
- Keep demo accounts separate from production
- Rotate JWT secrets regularly
- Use HTTPS in production
- Monitor login attempts for brute force

❌ **DON'T:**
- Use demo passwords for real users
- Store passwords in plaintext
- Share demo account credentials in production
- Disable password hashing
- Use weak JWT secrets

## Key Takeaways

1. **Dual paths work simultaneously** - Both demo and real users can login at the same time
2. **Database takes precedence** - Real users override demo accounts with same email
3. **Password security** - All DB passwords hashed with PBKDF2SHA256
4. **Zero breaking changes** - Existing demo functionality still works
5. **Development & Production ready** - Toggle DEMO_MODE to switch modes
