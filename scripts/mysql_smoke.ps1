param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
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
    Write-Host "MySQL smoke config parsed for database '$dbName' on '${dbHost}:${dbPort}'."
    exit 0
}

$previousMysqlPwd = $env:MYSQL_PWD
$env:MYSQL_PWD = $dbPassword

try {
    $queries = @(
        "SELECT 1 AS smoke_ok;",
        "SHOW TABLES LIKE 'users';",
        "SHOW TABLES LIKE 'services';",
        "SHOW TABLES LIKE 'requests';",
        "SHOW TABLES LIKE 'payment_records';",
        "SELECT version_num FROM alembic_version LIMIT 1;"
    )

    foreach ($query in $queries) {
        & $MysqlExe --host=$dbHost --port=$dbPort --user=$dbUser --database=$dbName --execute=$query
        if ($LASTEXITCODE -ne 0) {
            throw "MySQL smoke query failed: $query"
        }
    }
}
finally {
    $env:MYSQL_PWD = $previousMysqlPwd
}
