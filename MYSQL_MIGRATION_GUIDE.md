# Falco Electrec - SQLite to MySQL Migration Guide

## Summary
Your Falco Electrec application has been configured to use MySQL instead of SQLite.

## Configuration Details

### MySQL Connection Settings
- **Host**: localhost
- **Port**: 3306
- **Username**: root
- **Password**: Yy@102030
- **Database Name**: Graduation
- **Connection String**: `mysql+pymysql://root:Yy@102030@localhost:3306/Graduation`

## Prerequisites

Before proceeding, ensure you have:

1. **MySQL Server installed and running**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Install MySQL Community Edition for Windows

2. **MySQL Command Line Client in PATH**
   - Verify with: `mysql --version` in PowerShell

## Step-by-Step Setup

### Step 1: Verify MySQL is Running
```powershell
# Windows - Check if MySQL is running
Get-Service | Where-Object {$_.Name -like "*MySQL*"}

# Or connect to test connection:
mysql -u root -pYy@102030 -e "SELECT 1"
```

### Step 2: Create the Database
Run the setup script:

```powershell
# From the project root directory:
.\setup_mysql.bat   # Windows batch script
# OR
mysql -u root -pYy@102030 < setup_mysql.sql
```

### Step 3: Initialize Database Tables
The Flask application will automatically create all tables when it starts:

```powershell
cd backend
python run.py
```

The Flask-SQLAlchemy ORM will create all necessary tables from the defined models.

### Step 4: (Optional) Seed Initial Data
If you want to populate the database with demo data:

```powershell
cd backend
python seed_demo.py  # For demo data
# OR
# python seed.py     # For production seed data
```

## Backup & Export

### Backup the Current Database

**Using PowerShell:**
```powershell
.\backup_mysql.ps1
```

**Using Bash:**
```bash
./backup_mysql.sh
```

**Manual backup:**
```powershell
mysqldump -u root -pYy@102030 Graduation | Out-File -FilePath "backups/graduation_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
```

### Export Specific Tables
```powershell
mysqldump -u root -pYy@102030 Graduation request > backups/requests_table.sql
mysqldump -u root -pYy@102030 Graduation engineer > backups/engineers_table.sql
```

### Restore from Backup
```powershell
mysql -u root -pYy@102030 Graduation < backups/graduation_backup_20240101_120000.sql
```

## Configuration Files Updated

### Changed Files:
1. **`.env`** - Updated with new MySQL connection string
2. **`setup_mysql.sql`** - SQL script to create the database
3. **`setup_mysql.bat`** - Windows batch setup script
4. **`backup_mysql.ps1`** - PowerShell backup script
5. **`backup_mysql.sh`** - Bash backup script
6. **`backend/app/config.py`** - Already configured for MySQL (PyMySQL driver)
7. **`backend/requirements.txt`** - Already includes PyMySQL dependency

### No Changes Needed:
- Backend code is database-agnostic thanks to SQLAlchemy ORM
- Frontend remains unchanged

## Important Notes

### Data Migration
- Previous SQLite data **is not automatically migrated**
- Only new data created after MySQL setup will be in MySQL
- If you need to migrate old SQLite data, use a migration script

### Security
⚠️ **IMPORTANT**: The credentials in `.env` are now exposed:
```
DATABASE_URL=mysql+pymysql://root:Yy@102030@localhost:3306/Graduation
```

For production:
1. Use strong passwords
2. Create a dedicated MySQL user (not root)
3. Restrict host access
4. Use environment variables or secrets management
5. Never commit `.env` to version control

### Database Driver
The application uses **PyMySQL** (pure Python MySQL driver):
- Definition in `backend/requirements.txt`
- No need to install MySQL C libraries (unlike mysqlclient)
- Slightly slower but easier to deploy cross-platform

## Troubleshooting

### Connection Refused
```powershell
# Check if MySQL service is running
Get-Service MySQL80
# Start MySQL if stopped (adjust version number as needed)
Start-Service MySQL80
```

### "Access Denied" Error
```powershell
# Verify credentials
mysql -u root -pYy@102030 -e "SELECT 1"
# Check MySQL user exists
mysql -u root -pYy@102030 -e "SELECT user, host FROM mysql.user;"
```

### Database Already Exists
The setup script includes `CREATE DATABASE IF NOT EXISTS`, so it's safe to run multiple times.

### Port Already in Use
MySQL default port is 3306. If it's in use:
```powershell
# Find process using port 3306
Get-Process | Where-Object {$_.ProcessName -like "*mysql*"}

# Or use netstat
netstat -ano | findstr :3306
```

## Backend Environment

### Run Development Server
```powershell
cd backend
python run.py
```

The Flask app will:
1. Load `.env` configuration
2. Connect to MySQL database
3. Create tables automatically if they don't exist
4. Start on http://localhost:5000

### Run With Specific Config
```powershell
# Set Flask environment
$env:FLASK_ENV="development"
$env:DATABASE_URL="mysql+pymysql://root:Yy@102030@localhost:3306/Graduation"
python run.py
```

## Docker (Optional)

If using Docker Compose with MySQL:

```yaml
# In docker-compose.yml
mysql:
  image: mysql:8.0
  environment:
    MYSQL_ROOT_PASSWORD: Yy@102030
    MYSQL_DATABASE: Graduation
  ports:
    - "3306:3306"
  volumes:
    - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Start with: `docker-compose up -d mysql`

## Quick Reference Commands

```powershell
# Check MySQL connection
mysql -u root -pYy@102030 -e "SELECT DATABASE();"

# List all databases
mysql -u root -pYy@102030 -e "SHOW DATABASES;"

# List tables in Graduation database
mysql -u root -pYy@102030 -e "USE Graduation; SHOW TABLES;"

# Check table structure
mysql -u root -pYy@102030 -e "USE Graduation; DESCRIBE request;"

# Backup database
mysqldump -u root -pYy@102030 Graduation > backup.sql

# Restore database
mysql -u root -pYy@102030 Graduation < backup.sql

# Count records in a table
mysql -u root -pYy@102030 -e "USE Graduation; SELECT COUNT(*) FROM request;"
```

## Next Steps

1. ✓ Configuration updated in `.env`
2. ⏳ Run `.\setup_mysql.bat` to create the database
3. ⏳ Start backend: `cd backend && python run.py`
4. ⏳ Verify connection and see tables created
5. ⏳ Run `.\backup_mysql.ps1` to back up the database

## Support

For issues:
1. Check MySQL is running: `Get-Service MySQL80`
2. Verify credentials: `mysql -u root -pYy@102030 -e "SELECT 1"`
3. Check backend logs in `backend/run.py` output
4. Review Flask-SQLAlchemy documentation: https://flask-sqlalchemy.palletsprojects.com/
