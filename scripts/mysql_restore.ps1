param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$BackupFile,
    [string]$MysqlExe = $(if ($env:MYSQL_EXE) { $env:MYSQL_EXE } else { "mysql" }),
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
    Write-Host "MySQL restore config parsed for database '$dbName' on '${dbHost}:${dbPort}'."
    exit 0
}

if (-not $BackupFile -or !(Test-Path $BackupFile)) {
    throw "BackupFile is required and must exist"
}

$previousMysqlPwd = $env:MYSQL_PWD
$env:MYSQL_PWD = $dbPassword

try {
    Get-Content $BackupFile |
        & $MysqlExe --host=$dbHost --port=$dbPort --user=$dbUser --database=$dbName
    if ($LASTEXITCODE -ne 0) {
        throw "mysql restore failed"
    }
    Write-Host "Restore completed from: $BackupFile"
}
finally {
    $env:MYSQL_PWD = $previousMysqlPwd
}
