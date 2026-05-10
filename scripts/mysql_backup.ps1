param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$BackupDir = ".\backups",
    [string]$MysqlDumpExe = $(if ($env:MYSQLDUMP_EXE) { $env:MYSQLDUMP_EXE } else { "mysqldump" }),
    [switch]$ParseOnly
)

$ErrorActionPreference = "Stop"

if (-not $DatabaseUrl) {
    throw "DATABASE_URL is required. Expected mysql+pymysql://user:password@host:port/database"
}

$uri = [Uri]$DatabaseUrl
if ($uri.Scheme -notin @("mysql", "mysql+pymysql")) {
    throw "DATABASE_URL must use mysql or mysql+pymysql scheme"
}

$userInfo = $uri.UserInfo.Split(":", 2)
if ($userInfo.Count -lt 2) {
    throw "DATABASE_URL must include user and password"
}

$dbUser = [Uri]::UnescapeDataString($userInfo[0])
$dbPassword = [Uri]::UnescapeDataString($userInfo[1])
$dbHost = $uri.Host
$dbPort = if ($uri.Port -gt 0) { $uri.Port } else { 3306 }
$dbName = $uri.AbsolutePath.TrimStart("/")

if (-not $dbName) {
    throw "DATABASE_URL must include a database name"
}

if ($ParseOnly) {
    Write-Host "MySQL backup config parsed for database '$dbName' on '${dbHost}:${dbPort}'."
    exit 0
}

if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "$dbName`_backup_$timestamp.sql"
$previousMysqlPwd = $env:MYSQL_PWD
$env:MYSQL_PWD = $dbPassword

try {
    & $MysqlDumpExe --host=$dbHost --port=$dbPort --user=$dbUser --single-transaction --routines --triggers $dbName |
        Out-File -FilePath $backupFile -Encoding UTF8
    if ($LASTEXITCODE -ne 0) {
        throw "mysqldump failed"
    }
    Write-Host "Backup completed: $backupFile"
}
finally {
    $env:MYSQL_PWD = $previousMysqlPwd
}
