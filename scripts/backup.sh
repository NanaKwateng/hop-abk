#!/bin/bash
# scripts/backup.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

echo "🗄️ Starting database backup..."

# Check if we have Supabase CLI
if command -v supabase &> /dev/null; then
    echo "Using Supabase CLI for backup..."
    supabase db dump --data-only --file "$BACKUP_FILE" 2>/dev/null || echo "⚠️  Supabase CLI backup failed"
else
    echo "⚠️  Supabase CLI not found, skipping backup"
    echo "📝 Please install Supabase CLI: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if backup file was created
if [ -f "$BACKUP_FILE" ]; then
    # Compress backup
    gzip -f "$BACKUP_FILE"
    echo "✅ Backup created: $BACKUP_FILE.gz"
    
    # Keep only last 30 backups
    ls -tp $BACKUP_DIR/backup_*.sql.gz 2>/dev/null | grep -v '/$' | tail -n +31 | xargs -I {} rm -- {} 2>/dev/null || true
    echo "🧹 Cleaned up old backups"
else
    echo "❌ Backup failed - no file created"
    exit 1
fi

# Upload to S3 (optional)
if [ -n "$AWS_S3_BUCKET" ] && command -v aws &> /dev/null; then
    echo "📤 Uploading to S3..."
    aws s3 cp "$BACKUP_FILE.gz" "s3://$AWS_S3_BUCKET/backups/" 2>/dev/null || echo "⚠️  S3 upload failed"
    echo "✅ Upload complete"
fi

echo "✅ Backup process complete!"