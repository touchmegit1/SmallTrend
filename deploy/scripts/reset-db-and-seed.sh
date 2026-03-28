#!/usr/bin/env bash
# Reset (drop + create) database and seed again on Azure VM.
# Robust mode: continues through SQL errors, then verifies critical tables.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/smalltrend}"
COMPOSE_FILE="${COMPOSE_FILE:-$DEPLOY_PATH/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$DEPLOY_PATH/deploy/env/backend.env}"
SEED_FILE="${SEED_FILE:-$DEPLOY_PATH/backend/src/main/resources/data.sql}"
BACKUP_DIR="${BACKUP_DIR:-$DEPLOY_PATH/backup_data_value}"
SEED_LOG_DIR="${SEED_LOG_DIR:-$DEPLOY_PATH/deploy/seed-logs}"

log() {
  printf "[%s] %s\n" "$1" "$2"
}

require_file() {
  local path="$1"
  [ -f "$path" ] || {
    echo "Missing required file: $path"
    exit 1
  }
}

count_table() {
  local table="$1"
  docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM $table;" | tr -d '\r'
}

seed_with_data_sql() {
  mkdir -p "$SEED_LOG_DIR"
  local err_log="$SEED_LOG_DIR/data_sql_errors_$(date +%Y%m%d_%H%M%S).log"

  log "6/10" "Seeding from data.sql with --force (won't stop at first SQL error)"
  set +e
  docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql --force --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$SEED_FILE" 2>"$err_log"
  local rc=$?
  set -e

  if [ "$rc" -ne 0 ]; then
    log "WARN" "data.sql finished with errors (continued). See: $err_log"
  else
    log "INFO" "data.sql import completed successfully"
  fi
}

seed_with_backup_files() {
  [ -d "$BACKUP_DIR" ] || {
    log "WARN" "Backup directory not found: $BACKUP_DIR"
    return 1
  }

  log "8/10" "Fallback seed from backup_data_value/*.sql"

  # Disable FK checks to avoid order dependency across split files.
  docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SET FOREIGN_KEY_CHECKS=0;"

  local imported=0
  for f in "$BACKUP_DIR"/smalltrend_*.sql; do
    [ -f "$f" ] || continue
    echo "Importing $(basename "$f")"
    set +e
    docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql --force --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$f"
    local rc=$?
    set -e
    if [ "$rc" -ne 0 ]; then
      log "WARN" "Import had errors: $(basename "$f") (continued)"
    fi
    imported=$((imported + 1))
  done

  docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SET FOREIGN_KEY_CHECKS=1;"

  log "INFO" "Fallback import attempted $imported file(s)"
}

log "1/10" "Checking required files"
require_file "$COMPOSE_FILE"
require_file "$ENV_FILE"
require_file "$SEED_FILE"

cd "$DEPLOY_PATH"

log "2/10" "Reading required DB variables from backend.env"
get_env_value() {
  local key="$1"
  sed -n "s/^${key}=//p" "$ENV_FILE" | tail -n 1 | tr -d '\r'
}

MYSQL_DATABASE="$(get_env_value MYSQL_DATABASE)"
MYSQL_ROOT_PASSWORD="$(get_env_value MYSQL_ROOT_PASSWORD)"

: "${MYSQL_DATABASE:=smalltrend}"
: "${MYSQL_ROOT_PASSWORD:=root1234}"

log "3/10" "Starting mysql service"
docker compose -f "$COMPOSE_FILE" up -d mysql

log "4/10" "Waiting for mysql health"
MYSQL_CONTAINER_ID="$(docker compose -f "$COMPOSE_FILE" ps -q mysql)"
[ -n "$MYSQL_CONTAINER_ID" ] || {
  echo "Could not resolve mysql container ID"
  exit 1
}

MAX_ATTEMPTS=60
ATTEMPT=1
while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
  HEALTH="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$MYSQL_CONTAINER_ID")"
  if [ "$HEALTH" = "healthy" ]; then
    echo "MySQL is healthy"
    break
  fi
  echo "MySQL health: $HEALTH (attempt $ATTEMPT/$MAX_ATTEMPTS). Waiting 5s..."
  sleep 5
  ATTEMPT=$((ATTEMPT + 1))
done

if [ "$ATTEMPT" -gt "$MAX_ATTEMPTS" ]; then
  echo "MySQL did not become healthy in time"
  docker compose -f "$COMPOSE_FILE" logs --tail=120 mysql || true
  exit 1
fi

DB_ESCAPED="$(printf '%s' "$MYSQL_DATABASE" | sed 's/`/``/g')"
SQL_RESET="DROP DATABASE IF EXISTS \`$DB_ESCAPED\`; CREATE DATABASE \`$DB_ESCAPED\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

log "5/10" "Dropping and recreating database ($MYSQL_DATABASE)"
printf "%s\n" "$SQL_RESET" | docker compose -f "$COMPOSE_FILE" exec -T mysql \
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD"

seed_with_data_sql

log "7/10" "Verifying critical table counts after data.sql"
USERS_COUNT="$(count_table users)"
PRODUCTS_COUNT="$(count_table products)"
VARIANTS_COUNT="$(count_table product_variants)"
STOCK_COUNT="$(count_table inventory_stock)"
echo "users=$USERS_COUNT, products=$PRODUCTS_COUNT, variants=$VARIANTS_COUNT, inventory_stock=$STOCK_COUNT"

if [ "$PRODUCTS_COUNT" = "0" ] || [ "$VARIANTS_COUNT" = "0" ]; then
  log "WARN" "Critical product tables are empty after data.sql. Running fallback import..."
  seed_with_backup_files
fi

log "9/10" "Final verification"
USERS_COUNT="$(count_table users)"
PRODUCTS_COUNT="$(count_table products)"
VARIANTS_COUNT="$(count_table product_variants)"
STOCK_COUNT="$(count_table inventory_stock)"
echo "users=$USERS_COUNT, products=$PRODUCTS_COUNT, variants=$VARIANTS_COUNT, inventory_stock=$STOCK_COUNT"

if [ "$PRODUCTS_COUNT" = "0" ] || [ "$VARIANTS_COUNT" = "0" ]; then
  log "ERROR" "Seed finished but critical tables are still empty. Check logs in $SEED_LOG_DIR and backup SQL files."
  exit 1
fi

log "10/10" "Done"
echo "Database reset + seed completed for: $MYSQL_DATABASE"
echo "Next command:"
echo "  docker compose -f $COMPOSE_FILE up -d --remove-orphans"