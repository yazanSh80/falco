# Falco Electrec - Database Implementation Guide

## Overview

This guide walks through the complete database initialization for the **Falco Electrec** application using SQLAlchemy ORM and MySQL.

**Status**: ✅ Ready for Implementation
**Database**: Graduation (MySQL 8.0)
**Framework**: Flask + SQLAlchemy + Flask-Migrate
**Driver**: PyMySQL

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Implementation Steps](#implementation-steps)
4. [Database Schema Summary](#database-schema-summary)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)
7. [Backup & Restore](#backup--restore)

---

## Prerequisites

### Required Software
✅ MySQL Server 8.0 (already installed)
✅ Python 3.8+ (with pip)
✅ Flask and dependencies (in requirements.txt)

### Verification

```powershell
# Check MySQL installation
mysql --version
# Expected: mysql  Ver 8.0.36 for Win64 on x86_64

# Check Python
python --version
# Expected: Python 3.x.x

# Check pip packages
pip list | findstr Flask
# Expected: Flask packages listed
```

### Connection Details
- **Host**: localhost
- **Port**: 3306
- **Username**: root
- **Password**: Yy@102030
- **Database**: Graduation

---

## Architecture Overview

### Database Structure

```
┌─────────────────────────────────────────────────────┐
│                   GRADUATION DATABASE                 │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  USERS (multi-role system)                    │   │
│  │  ├─ Admin (system administration)            │   │
│  │  ├─ Engineer (service providers)              │   │
│  │  └─ Customer (service requesters)             │   │
│  └──────────────────────────────────────────────┘   │
│         │                    │                       │
│         ├─→ ENGINEER_PROFILES (1:1)                 │
│         │    └─→ PORTFOLIO_ITEMS (1:M)              │
│         │                                            │
│         ├─→ REQUESTS (1:M as customer/engineer)      │
│         │    ├─→ REVIEWS (1:M)                       │
│         │    ├─→ TRANSACTIONS (1:1)                  │
│         │    └─→ DISPUTES (1:M)                      │
│         │                                            │
│         ├─→ NOTIFICATIONS (1:M)                      │
│         └─→ BLOCKS (M:M bidirectional)               │
│                                                       │
│  FEATURES ──→ SERVICES ──→ REQUESTS (catalog)        │
│  AREAS (geographic regions)                         │
│  TOKEN_BLOCKLIST (JWT invalidation)                 │
│  ADMIN_ACTION_LOGS (audit trail)                    │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### Entity Count Summary

| Entity | Purpose | Count | Critical |
|--------|---------|-------|----------|
| users | User accounts | 100-1K | ✓ CORE |
| engineer_profiles | Engineer data | 10-100 | ✓ CORE |
| requests | Service requests | 1K-10K | ✓ CORE |
| services | Service catalog | 18+ | ✓ CORE |
| features | Service categories | 7 | ✓ CORE |
| reviews | Ratings/feedback | 500-5K | ✓ CORE |
| transactions | Financials | 500-5K | ✓ CORE |
| portfolio_items | Engineer showcase | 100-500 | OPTIONAL |
| blocks | User safety | 10-100 | SAFETY |
| notifications | Alerts | 1K-10K | EVENT |
| disputes | Complaints | 10-100 | SAFETY |
| areas | Regions | 7-20 | CONFIG |
| token_blocklist | JWT revocation | 100-1K | SECURITY |
| admin_action_logs | Audit trail | 100-10K | ✓ AUDIT |

---

## Implementation Steps

### Phase 1: Database Creation ✅ (Already Complete)

The database has already been created:

```sql
CREATE DATABASE Graduation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Verify:**
```powershell
mysql -u root -pYy@102030 -e "SHOW DATABASES;" | findstr Graduation
```

---

### Phase 2: Table Creation (Choose ONE method below)

#### Method A: Use SQLAlchemy ORM (Recommended) ⭐

This method reads the Python models and creates tables automatically.

**Step 1**: Navigate to backend directory
```powershell
cd backend
```

**Step 2**: Run initialization script
```powershell
python init_database.py
```

This script will:
- ✓ Create all 14 tables
- ✓ Set up foreign key relationships
- ✓ Create indexes and constraints
- ✓ Seed initial features, services, and areas

**Expected Output:**
```
======================================================================
  FALCO ELECTREC - DATABASE INITIALIZATION
======================================================================

Database: Graduation
User: root
Host: localhost
Time: 2026-04-05 20:30:45

[Step 1] Creating tables via SQLAlchemy ORM...
✓ All tables created via ORM
[Step 2] Verifying database schema...
✓ Database verification complete

Tables created: 14
  ✓ users
  ✓ engineer_profiles
  ✓ services
  ✓ features
  ✓ requests
  ✓ reviews
  ✓ transactions
  ✓ portfolio_items
  ✓ blocks
  ✓ notifications
  ✓ disputes
  ✓ areas
  ✓ token_blocklist
  ✓ admin_action_logs

[Step 3] Seeding initial data...
✓ Created 7 features
✓ Created 18 services
✓ Created 7 service areas

======================================================================
INITIALIZATION COMPLETE
======================================================================

✓ Database initialized successfully!

Next steps:
  1. Start the Flask backend: python run.py
  2. Run demo seed if needed: python seed_demo.py
  3. Access API at: http://localhost:5000
  4. View Swagger docs at: http://localhost:5000/api/docs
```

---

#### Method B: Use Raw SQL (Alternative)

If ORM method has issues, execute SQL directly:

```powershell
# Run the SQL schema file
cd c:\Users\PC\OneDrive\Desktop\falco-main
Get-Content DATABASE_SCHEMA.sql | & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pYy@102030
```

Then seed data:
```powershell
cd backend
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print('Tables created')"
```

---

#### Method C: Use Flask-Migrate (Advanced)

For version control of migrations:

```powershell
cd backend

# Initialize migrations (one-time only)
flask db init

# Generate migration from models
flask db migrate -m "Initial schema from models"

# Apply migration
flask db upgrade

# View migration history
flask db history
```

---

### Phase 3: Verify Schema

After tables are created, verify the structure:

```powershell
# Check all tables exist
mysql -u root -pYy@102030 -e "USE Graduation; SHOW TABLES;"

# Check users table structure
mysql -u root -pYy@102030 -e "USE Graduation; DESCRIBE users;"

# Check foreign keys
mysql -u root -pYy@102030 -e "USE Graduation; SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='Graduation' AND REFERENCED_TABLE_NAME IS NOT NULL;"

# Check indexes
mysql -u root -pYy@102030 -e "USE Graduation; SHOW INDEX FROM requests;"
```

**Expected**: 14 tables, 40+ indexes, 25+ foreign keys

---

### Phase 4: Run Backend Application

The Flask app will use the database when started:

```powershell
cd backend
python run.py
```

**Expected Output:**
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

**Test the connection:**
```powershell
# In another terminal
curl http://localhost:5000/api/health
```

---

### Phase 5: Seed Demo Data (Optional)

For testing with realistic data:

```powershell
cd backend
python seed_demo.py
```

**Creates**:
- 50+ user accounts (customers, engineers, admin)
- 30+ service requests in various states
- Reviews and ratings
- Financial transactions
- Disputes and resolutions
- Admin audit logs
- Notifications timeline

---

### Phase 6: Backup Initial Database

After setup is complete, create a backup:

```powershell
# PowerShell backup
.\backup_mysql.ps1

# Manual backup
mysqldump -u root -pYy@102030 Graduation | Out-File "backups/graduation_init_backup.sql"
```

---

## Database Schema Summary

### 14 Tables Total

#### Core Entities (User & Profile)
1. **users** - Multi-role account system
   - 100+ columns across all users
   - 4 roles: admin, engineer, customer, pending
   - Email-based authentication

2. **engineer_profiles** - Extended engineer data
   - Rating system (1-5 stars)
   - Experience levels
   - Subscription management
   - Credentials (CV, certificates)

#### Service Catalog
3. **features** - Service categories
   - 7 features: AC, Plumbing, Carpentry, Electricity, Aluminum, Painting, Other

4. **services** - Individual service offerings
   - 18+ services
   - Base pricing from 100-1500 NIS
   - Feature-linked

#### Business Core
5. **requests** - Service request management
   - Type: quick (2hr response, 24hr completion) or late (24hr, 72hr)
   - Status tracking: pending → accepted → in_progress → completed
   - SLA breach detection
   - Geographic coordinates

6. **reviews** - Ratings and feedback
   - 1-5 star system
   - Bidirectional (customer ↔ engineer)
   - Linked to requests

7. **transactions** - Financial records
   - Commission calculation: 0% for ≤700 NIS, 5% for >700 NIS
   - Gross, commission, net amounts
   - One per completed request

#### Extended Features
8. **portfolio_items** - Engineer portfolios
   - Showcase of completed work
   - Image URLs
   - Project descriptions

9. **blocks** - User blocking (safety)
   - Bidirectional blocking
   - Prevents communication

10. **notifications** - In-app alerts
    - 9 notification types
    - Read/unread tracking
    - Timeline-based

11. **disputes** - Complaint handling
    - 7 categories: quality, incomplete, overcharge, delay, behavior, damage, other
    - Resolution actions: refund, warn, block
    - Audit trail

#### Admin & Security
12. **areas** - Geographic serviceregions
    - 7+ Palestinian areas
    - Arabic names
    - Engineer/customer counts

13. **token_blocklist** - JWT invalidation
    - Revoked tokens
    - Logout tracking
    - Security

14. **admin_action_logs** - Audit trail
    - All admin actions logged
    - IP tracking
    - Action-specific details in JSON
    - 22+ action types

---

## Verification & Testing

### Basic Connectivity Test

```powershell
# Test direct MySQL connection
mysql -u root -pYy@102030 -e "SELECT 1 AS connection_test;"
# Expected: connection_test | 1
```

### Database Integrity Check

```sql
-- Check table counts
SELECT 
    (SELECT COUNT(*) FROM users) as user_count,
    (SELECT COUNT(*) FROM requests) as request_count,
    (SELECT COUNT(*) FROM services) as service_count,
    (SELECT COUNT(*) FROM features) as feature_count;

-- Check foreign key relationships
SELECT CONSTRAINT_NAME, TABLE_NAME, REFERENCED_TABLE_NAME 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA='Graduation' 
  AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

-- Verify index coverage
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA='Graduation'
ORDER BY TABLE_NAME, INDEX_NAME;
```

### ORM Model Testing

```python
from app import create_app, db
from app.models.user import User
from app.models.service import Service
from app.models.area import Area

app = create_app()

with app.app_context():
    # Check feature count
    features = Service.query.count()
    print(f"Services: {features}")
    
    # Check areas
    areas = Area.query.count()
    print(f"Areas: {areas}")
    
    # Check users
    users = User.query.count()
    print(f"Users: {users}")
```

---

## Troubleshooting

### Issue 1: "Access Denied" when connecting

```
ERROR 1045 (28000): Access denied for user 'root'@'localhost'
```

**Solution**:
```powershell
# Verify credentials
mysql -u root -pYy@102030 -e "SELECT 1;"

# Check if MySQL service is running
Get-Service | Where-Object {$_.Name -like "*MySQL*"}

# Start MySQL if needed
Start-Service MySQL80
```

### Issue 2: "Database does not exist"

```
ERROR 1049 (42000): Unknown database 'nonexistent_db'
```

**Solution**:
```powershell
# The database should already exist
mysql -u root -pYy@102030 -e "SHOW DATABASES;" | findstr Graduation

# If missing, create it:
mysql -u root -pYy@102030 -e "CREATE DATABASE Graduation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Issue 3: "Table already exists"

```
ERROR 1050 (42S01): Table 'users' already exists
```

**Solution**: Tables are idempotent (IF NOT EXISTS clause), safe to run multiple times.

### Issue 4: Foreign key constraint errors

```
ERROR 1452 (23000): Cannot add or update a child row
```

**Solution**:
```sql
-- Temporarily disable FK checks during seeding
SET FOREIGN_KEY_CHECKS=0;
-- ... run commands ...
SET FOREIGN_KEY_CHECKS=1;

-- Or create tables in correct order (dependencies first)
-- The SQL schema already handles this
```

### Issue 5: PyMySQL connection issues in Flask

```
Error: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server")
```

**Solution**:
```python
# Check connection string in .env
DATABASE_URL=mysql+pymysql://root:Yy@102030@localhost:3306/Graduation

# Verify MySQL is running
# Verify port 3306 is not blocked
# Check credentials are correct
```

### Issue 6: Flask-Migrate conflicts

```
migrations folder already exists
```

**Solution**:
```powershell
# If migrations folder exists, use upgrade instead of init
flask db upgrade

# Or remove old migrations and reinit
rm -r migrations
flask db init
flask db migrate -m "Initial"
flask db upgrade
```

---

## Backup & Restore

### Create Backup

**PowerShell Method:**
```powershell
.\backup_mysql.ps1
# Creates: backups/graduation_backup_YYYYMMDD_HHMMSS.sql
```

**Manual Method:**
```powershell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
mysqldump -u root -pYy@102030 Graduation | Out-File "backups/graduation_backup_$timestamp.sql"
```

**Bash Method:**
```bash
./backup_mysql.sh
# Creates: backups/graduation_backup_YYYYMMDD_HHMMSS.sql
```

### Restore from Backup

```powershell
# Full database restore
mysql -u root -pYy@102030 Graduation < backups/graduation_backup_20260405_203045.sql

# Or via PowerShell:
Get-Content backups/graduation_backup_20260405_203045.sql | `
  & "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pYy@102030 Graduation
```

### Export Specific Tables

```powershell
# Export requests table
mysqldump -u root -pYy@102030 Graduation requests > backups/requests_only.sql

# Export multiple tables
mysqldump -u root -pYy@102030 Graduation users requests reviews > backups/core_tables.sql

# Export with no data (schema only)
mysqldump -u root -pYy@102030 --no-data Graduation > backups/schema_only.sql

# Export with data and drop commands
mysqldump -u root -pYy@102030 --add-drop-table Graduation > backups/graduate_full_drop.sql
```

### Automation (Scheduled Backups)

**Windows Task Scheduler:**
```batch
# Create backup.bat
@echo off
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set timestamp=%mydate%_%mytime%

cd C:\Users\PC\OneDrive\Desktop\falco-main
mysqldump -u root -pYy@102030 Graduation > backups\graduation_backup_%timestamp%.sql

# Schedule via Task Scheduler
schtasks /create /tn "GraduationDBBackup" /tr "C:\path\to\backup.bat" /sc daily /st 02:00
```

---

## Performance Optimization

### Index Analysis

The schema includes 40+ indexes optimized for:

```sql
-- Login/lookup speed (O(log n))
CREATE INDEX idx_users_email ON users(email);

-- Request filtering (O(log n))
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_customer_id ON requests(customer_id);

-- Transaction reports (O(log n))
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Notification delivery
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, read);
```

### Query Optimization Tips

```sql
-- ✓ GOOD: Uses indexed columns
SELECT * FROM requests WHERE status='completed' AND customer_id=42;

-- ✗ POOR: Function on indexed column
SELECT * FROM requests WHERE YEAR(created_at)=2026;

-- ✓ BETTER: Date range
SELECT * FROM requests WHERE created_at BETWEEN '2026-01-01' AND '2026-12-31';

-- ✓ GOOD: Filtered aggregation
SELECT engineer_id, COUNT(*) FROM requests 
WHERE status='completed' 
GROUP BY engineer_id;
```

### Database Maintenance

```sql
-- Analyze table statistics (optimizer hint)
ANALYZE TABLE requests;

-- Optimize fragmented tables
OPTIMIZE TABLE requests;

-- Check table for errors
CHECK TABLE requests;

-- Repair if needed
REPAIR TABLE requests;
```

---

## Next Steps

After initialization:

1. ✅ Database created and tables initialized
2. ✅ Schema verified with all constraints
3. ⏳ **Start Flask backend**: `python run.py`
4. ⏳ **Seed demo data**: `python seed_demo.py` (optional)
5. ⏳ **Create first admin user**: Via API endpoint
6. ⏳ **Configure frontend**: Point to API
7. ⏳ **Test workflows**: Create requests, accept jobs, etc.
8. ⏳ **Monitor performance**: Check slow queries
9. ⏳ **Set up backups**: Schedule nightly backups

---

## Reference Documentation

- **Database Analysis**: See [DATABASE_ANALYSIS.md](DATABASE_ANALYSIS.md)
- **Raw SQL Schema**: See [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql)
- **Backend Code**: [backend/app/models/](../backend/app/models/)
- **API Documentation**: http://localhost:5000/api/docs (Swagger)
- **MySQL Documentation**: https://dev.mysql.com/doc/
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/

---

## Support & Issues

### Getting Help

1. **Check logs**: `backend/run.py` output
2. **Verify setup**: Run verification queries above
3. **Review errors**: MySQL error code + SQLAlchemy traceback
4. **Check docs**: [DATABASE_ANALYSIS.md](DATABASE_ANALYSIS.md)

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Access Denied" | Wrong password | Verify credentials in .env |
| "Unknown Database" | DB doesn't exist | Run setup_mysql.sql |
| "Table Locked" | Long transaction | Restart MySQL service |
| "Disk Full" | Storage issue | Check disk space |

---

**Status**: ✅ Complete and Ready to Deploy
**Last Updated**: 2026-04-05
**Version**: 1.0
