# PowerShell MySQL Backup Script for Falco Electrec
# This script backs up the Graduation database to a file

param(
    [string]$BackupDir = ".\backups",
    [string]$DbName = "Graduation",
    [string]$DbUser = "root",
    [string]$DbPassword = "Yy@102030"
)

# Create backups directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
    Write-Host "Created backup directory: $BackupDir"
}

# Generate timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = Join-Path $BackupDir "graduation_backup_$timestamp.sql"

Write-Host "Starting backup of database: $DbName"
Write-Host "Backup file: $backupFile"
Write-Host ""

# Perform the backup using mysqldump
try {
    mysqldump -u $DbUser -p$DbPassword $DbName | Out-File -FilePath $backupFile -Encoding UTF8
    
    if ($LASTEXITCODE -eq 0) {
        $fileInfo = Get-Item $backupFile
        Write-Host "✓ Backup completed successfully!" -ForegroundColor Green
        Write-Host "Location: $($fileInfo.FullName)"
        Write-Host "Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB"
    } else {
        Write-Host "✗ Backup failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error during backup: $_" -ForegroundColor Red
    exit 1
}
