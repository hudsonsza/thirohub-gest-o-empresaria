#!/usr/bin/env bash

set -euo pipefail

# Simple restore using local dump file and Docker MySQL

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DUMP_FILE="${SCRIPT_DIR}/thiro_vendas_dump.sql"

DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-thiro}"
DB_PASS="${DB_PASS:-thiro}"
DB_NAME="${DB_NAME:-thiro}"

echo "==> Using dump file: ${DUMP_FILE}"
if [ ! -f "${DUMP_FILE}" ]; then
  echo "Dump file not found: ${DUMP_FILE}"
  exit 1
fi

echo "==> Restoring dump into MySQL..."
echo "Host: ${DB_HOST}, Port: ${DB_PORT}, DB: ${DB_NAME}, User: ${DB_USER}"

mysql \
  -h "${DB_HOST}" \
  -P "${DB_PORT}" \
  -u "${DB_USER}" \
  -p"${DB_PASS}" \
  "${DB_NAME}" < "${DUMP_FILE}"

echo "==> Restore completed successfully."
