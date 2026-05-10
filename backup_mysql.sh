#!/bin/bash
# MySQL Backup Script for Falco Electrec
# This script backs up the Graduation database

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
DB_NAME="Graduation"
DB_USER="root"
DB_PASSWORD="Yy@102030"
BACKUP_FILE="$BACKUP_DIR/graduation_backup_$TIMESTAMP.sql"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting backup of database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"

# Perform the backup
mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✓ Backup completed successfully!"
    echo "Location: $(pwd)/$BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
else
    echo "✗ Backup failed!"
    exit 1
fi
