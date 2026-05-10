param(
    [string]$Python = ".\.venv\Scripts\python.exe"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Push-Location $Root
try {
    & $Python -m pytest backend\tests
    npm run type-check
    npm run lint
    npm run build
}
finally {
    Pop-Location
}
