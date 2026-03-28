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
  local out
  if out="$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d '\r')"; then
    printf '%s\n' "${out:-0}"
  else
    # Table may not exist yet - treat as 0 so fallback logic can continue.
    printf '0\n'
  fi
}

bootstrap_schema() {
  log "6/10" "Bootstrapping schema via backend (SPRING_JPA_DDL_AUTO=update)"

  # Start backend once with schema auto-update to create missing tables in fresh DB.
  SPRING_JPA_DDL_AUTO=update SPRING_SQL_INIT_MODE=never \
    docker compose -f "$COMPOSE_FILE" up -d backend

  local attempts=40
  local i=1
  while [ "$i" -le "$attempts" ]; do
    users_tbl="$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
      -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE' AND table_name='users';" 2>/dev/null | tr -d '\r' || echo 0)"

    if [ "${users_tbl:-0}" = "1" ]; then
      echo "Schema bootstrap ready (users table exists)."
      return 0
    fi

    echo "Waiting schema bootstrap... ($i/$attempts)"
    sleep 3
    i=$((i + 1))
  done

  echo "Schema bootstrap timed out. Backend logs:"
  docker compose -f "$COMPOSE_FILE" logs --tail=120 backend || true
  return 1
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

repair_core_tables() {
  log "9/10" "Repairing core tables (products/inventory_stock) if still empty"

  local products_sql="$BACKUP_DIR/smalltrend_products.sql"
  if [ "$(count_table products)" = "0" ] && [ -f "$products_sql" ]; then
    echo "Attempting targeted products restore from $(basename "$products_sql")"
    docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SET FOREIGN_KEY_CHECKS=0; TRUNCATE TABLE products;"

    set +e
    docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql --force --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$products_sql"
    local rc=$?
    set -e
    if [ "$rc" -ne 0 ]; then
      log "WARN" "Targeted products restore had SQL errors (continued)."
    fi

    docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SET FOREIGN_KEY_CHECKS=1;"
  fi

  if [ "$(count_table inventory_stock)" = "0" ]; then
    echo "inventory_stock is empty; generating baseline stock rows from existing batches"
    docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "
        INSERT INTO inventory_stock (variant_id, batch_id, location_id, quantity)
        SELECT b.variant_id,
               b.id,
               (SELECT id FROM locations ORDER BY id LIMIT 1),
               100
        FROM product_batches b
        WHERE b.variant_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM inventory_stock s WHERE s.batch_id = b.id
          )
        LIMIT 500;
      "
  fi
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

bootstrap_schema

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

repair_core_tables

log "10/10" "Final verification"
USERS_COUNT="$(count_table users)"
PRODUCTS_COUNT="$(count_table products)"
VARIANTS_COUNT="$(count_table product_variants)"
STOCK_COUNT="$(count_table inventory_stock)"
echo "users=$USERS_COUNT, products=$PRODUCTS_COUNT, variants=$VARIANTS_COUNT, inventory_stock=$STOCK_COUNT"

if [ "$PRODUCTS_COUNT" = "0" ] || [ "$VARIANTS_COUNT" = "0" ]; then
  log "ERROR" "Seed finished but critical tables are still empty. Check logs in $SEED_LOG_DIR and backup SQL files."
  exit 1
fi

log "DONE" "Seed completed"
echo "Database reset + seed completed for: $MYSQL_DATABASE"
echo "Next command:"
echo "  docker compose -f $COMPOSE_FILE up -d --remove-orphans"