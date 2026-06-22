#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/mongodb}"
MONGO_HOST="${MONGO_HOST:-127.0.0.1}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-ecommerce}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

if [[ -z "${MONGO_USER:-}" || -z "${MONGO_PASSWORD:-}" ]]; then
  echo "Set MONGO_USER and MONGO_PASSWORD environment variables." >&2
  exit 1
fi

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DUMP_DIR="$BACKUP_DIR/$TIMESTAMP"
ARCHIVE_FILE="$BACKUP_DIR/mongodb_${MONGO_DB}_$TIMESTAMP.tar.gz"

mkdir -p "$BACKUP_DIR"

mongodump \
  --host "$MONGO_HOST" \
  --port "$MONGO_PORT" \
  --username "$MONGO_USER" \
  --password "$MONGO_PASSWORD" \
  --authenticationDatabase "$MONGO_DB" \
  --db "$MONGO_DB" \
  --out "$DUMP_DIR"

tar -czf "$ARCHIVE_FILE" -C "$DUMP_DIR" .
rm -rf "$DUMP_DIR"

find "$BACKUP_DIR" -type f -name "mongodb_${MONGO_DB}_*.tar.gz" -mtime +"$RETENTION_DAYS" -delete

echo "MongoDB backup complete: $ARCHIVE_FILE"
