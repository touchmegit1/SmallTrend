#!/usr/bin/env bash
# Reset (drop + create) database and seed again on Azure VM.
# Strict mode: fail fast on SQL errors, then verify critical domains.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/smalltrend}"
COMPOSE_FILE="${COMPOSE_FILE:-$DEPLOY_PATH/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$DEPLOY_PATH/deploy/env/backend.env}"
SEED_FILE="${SEED_FILE:-$DEPLOY_PATH/deploy/fix_seed.sql}"
LEGACY_SEED_FILE="${LEGACY_SEED_FILE:-$DEPLOY_PATH/backend/src/main/resources/data.sql}"
SEED_LOG_DIR="${SEED_LOG_DIR:-$DEPLOY_PATH/deploy/seed-logs}"
SEED_STRATEGY="${SEED_STRATEGY:-fix-only}"

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

scalar_query() {
  local sql="$1"
  local out
  if out="$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "$sql" 2>/dev/null | tr -d '\r')"; then
    printf '%s\n' "${out:-0}"
  else
    printf '0\n'
  fi
}

seed_tables_from_file() {
  local source_file="$1"
  awk '
    {
      if (match($0, /^[[:space:]]*(TRUNCATE TABLE|INSERT INTO|ALTER TABLE)[[:space:]]+`?([A-Za-z0-9_]+)`?/, m)) {
        table = m[2]
        if (!(table in seen)) {
          seen[table] = 1
          print table
        }
      }
    }
  ' "$source_file"
}

bootstrap_schema() {
  log "6/10" "Bootstrapping schema via backend (SPRING_JPA_DDL_AUTO=update)"

  # Start backend once with schema auto-update to create missing tables in fresh DB.
  SPRING_JPA_DDL_AUTO=update SPRING_SQL_INIT_MODE=never \
    docker compose -f "$COMPOSE_FILE" up -d backend

  local schema_seed_file="$SEED_FILE"
  case "$SEED_STRATEGY" in
    data-only|data-first)
      schema_seed_file="$LEGACY_SEED_FILE"
      ;;
  esac

  mapfile -t required_tables < <(seed_tables_from_file "$schema_seed_file")
  if [ "${#required_tables[@]}" -eq 0 ]; then
    echo "Warning: cannot derive required tables from $schema_seed_file, fallback to users table readiness check."
    required_tables=("users")
  fi

  local required_count="${#required_tables[@]}"
  local in_list
  in_list="$(printf "'%s'," "${required_tables[@]}")"
  in_list="${in_list%,}"

  local attempts=80
  local i=1
  local users_tbl
  local ready_count
  while [ "$i" -le "$attempts" ]; do
    users_tbl="$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
      -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE' AND table_name='users';" 2>/dev/null | tr -d '\r' || echo 0)"

    ready_count="$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
      -e "SELECT COUNT(DISTINCT table_name) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE' AND table_name IN ($in_list);" 2>/dev/null | tr -d '\r' || echo 0)"

    if [ "${ready_count:-0}" = "$required_count" ]; then
      echo "Schema bootstrap ready ($ready_count/$required_count seed tables exist)."
      return 0
    fi

    echo "Waiting schema bootstrap... ($i/$attempts) users=${users_tbl:-0}, seed_tables=${ready_count:-0}/$required_count"
    sleep 3
    i=$((i + 1))
  done

  local missing=()
  local tbl
  for tbl in "${required_tables[@]}"; do
    local exists
    exists="$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
      -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE' AND table_name='$tbl';" 2>/dev/null | tr -d '\r' || echo 0)"
    if [ "${exists:-0}" != "1" ]; then
      missing+=("$tbl")
    fi
  done

  echo "Schema bootstrap timed out. Backend logs:"
  docker compose -f "$COMPOSE_FILE" logs --tail=120 backend || true
  if [ "${#missing[@]}" -gt 0 ]; then
    echo "Missing tables after bootstrap: ${missing[*]}"
  fi
  return 1
}

seed_with_data_sql() {
  mkdir -p "$SEED_LOG_DIR"
  local err_log="$SEED_LOG_DIR/data_sql_errors_$(date +%Y%m%d_%H%M%S).log"

  if grep -q "DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS" "$LEGACY_SEED_FILE"; then
    log "ERROR" "Legacy mock patch marker detected in data.sql. Refusing to seed."
    return 1
  fi

  log "6/10" "Seeding from data.sql (strict mode)"
  if ! docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$LEGACY_SEED_FILE" 2>"$err_log"; then
    log "ERROR" "data.sql import failed. See: $err_log"
    tail -n 60 "$err_log" || true
    return 1
  fi

  if grep -q "^ERROR " "$err_log" 2>/dev/null; then
    log "ERROR" "data.sql contains SQL errors. See: $err_log"
    tail -n 30 "$err_log" || true
    return 1
  fi

  log "INFO" "data.sql import completed successfully"
}

verify_core_counts() {
  USERS_COUNT="$(count_table users)"
  PRODUCTS_COUNT="$(count_table products)"
  VARIANTS_COUNT="$(count_table product_variants)"
  STOCK_COUNT="$(count_table inventory_stock)"
  SALE_ORDERS_COUNT="$(count_table sale_orders)"
  SALE_ORDER_ITEMS_COUNT="$(count_table sale_order_items)"
  SALE_ORDER_HISTORIES_COUNT="$(count_table sale_order_histories)"
  PURCHASE_ORDERS_COUNT="$(count_table purchase_orders)"
  INVENTORY_COUNTS_COUNT="$(count_table inventory_counts)"
  DISPOSAL_VOUCHERS_COUNT="$(count_table disposal_vouchers)"
  ADVERTISEMENTS_COUNT="$(count_table advertisements)"
  TICKETS_COUNT="$(count_table tickets)"
  LOYALTY_GIFTS_COUNT="$(count_table loyalty_gifts)"
  echo "users=$USERS_COUNT, products=$PRODUCTS_COUNT, variants=$VARIANTS_COUNT, inventory_stock=$STOCK_COUNT, sale_orders=$SALE_ORDERS_COUNT, sale_order_items=$SALE_ORDER_ITEMS_COUNT, sale_order_histories=$SALE_ORDER_HISTORIES_COUNT, tickets=$TICKETS_COUNT, loyalty_gifts=$LOYALTY_GIFTS_COUNT"
  echo "purchase_orders=$PURCHASE_ORDERS_COUNT, inventory_counts=$INVENTORY_COUNTS_COUNT, disposal_vouchers=$DISPOSAL_VOUCHERS_COUNT, advertisements=$ADVERTISEMENTS_COUNT"
}

verify_core_integrity() {
  JOINABLE_VARIANTS_COUNT="$(scalar_query "SELECT COUNT(*) FROM product_variants pv LEFT JOIN products p ON p.id = pv.product_id LEFT JOIN units u ON u.id = pv.unit_id WHERE p.id IS NOT NULL AND u.id IS NOT NULL;")"
  ORPHAN_PRODUCT_REFS="$(scalar_query "SELECT COUNT(*) FROM product_variants pv LEFT JOIN products p ON p.id = pv.product_id WHERE p.id IS NULL;")"
  ORPHAN_UNIT_REFS="$(scalar_query "SELECT COUNT(*) FROM product_variants pv LEFT JOIN units u ON u.id = pv.unit_id WHERE u.id IS NULL;")"
  STOCKED_VARIANTS_COUNT="$(scalar_query "SELECT COUNT(DISTINCT variant_id) FROM inventory_stock WHERE COALESCE(quantity, 0) > 0;")"
  echo "joinable_variants=$JOINABLE_VARIANTS_COUNT, orphan_product_refs=$ORPHAN_PRODUCT_REFS, orphan_unit_refs=$ORPHAN_UNIT_REFS, stocked_variants=$STOCKED_VARIANTS_COUNT"
}

seed_with_fix_seed() {
  mkdir -p "$SEED_LOG_DIR"
  local err_log="$SEED_LOG_DIR/fix_seed_errors_$(date +%Y%m%d_%H%M%S).log"

  [ -f "$SEED_FILE" ] || {
    log "WARN" "Fix seed file not found: $SEED_FILE"
    return 1
  }

  if grep -q "DỮ LIỆU BÙ ĐẮP CHO CÁC BẢNG BỊ LỖI SCHEMA TRANSACTIONS" "$SEED_FILE"; then
    log "ERROR" "Legacy mock patch marker detected in fix_seed.sql. Refusing to seed."
    return 1
  fi

  log "8/10" "Seeding from deploy/fix_seed.sql (strict mode)"
  if ! docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$SEED_FILE" 2>"$err_log"; then
    log "ERROR" "fix_seed.sql import failed. See: $err_log"
    tail -n 60 "$err_log" || true
    return 1
  fi

  if grep -q "^ERROR " "$err_log" 2>/dev/null; then
    log "ERROR" "fix_seed.sql contains SQL errors. See: $err_log"
    tail -n 30 "$err_log" || true
    return 1
  fi

  log "INFO" "fix_seed.sql import completed successfully"
}

log "1/10" "Checking required files"
require_file "$COMPOSE_FILE"
require_file "$ENV_FILE"
case "$SEED_STRATEGY" in
  data-only|data-first)
    require_file "$LEGACY_SEED_FILE"
    ;;
  *)
    require_file "$SEED_FILE"
    ;;
esac

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

log "6/10" "Running seed strategy: $SEED_STRATEGY"
case "$SEED_STRATEGY" in
  fix-only|fix-first)
    seed_with_fix_seed
    ;;
  data-only|data-first)
    seed_with_data_sql
    ;;
  *)
    log "ERROR" "Invalid SEED_STRATEGY=$SEED_STRATEGY (allowed: fix-only|data-only)"
    exit 1
    ;;
esac

log "7/10" "Verifying critical table counts after primary seed"
verify_core_counts
verify_core_integrity

log "10/10" "Final verification"
verify_core_counts
verify_core_integrity

if [ "$USERS_COUNT" = "0" ] || [ "$PRODUCTS_COUNT" = "0" ] || [ "$VARIANTS_COUNT" = "0" ] || [ "$STOCK_COUNT" = "0" ] || [ "$SALE_ORDERS_COUNT" = "0" ] || [ "$SALE_ORDER_ITEMS_COUNT" = "0" ] || [ "$SALE_ORDER_HISTORIES_COUNT" = "0" ] || [ "$TICKETS_COUNT" = "0" ] || [ "$LOYALTY_GIFTS_COUNT" = "0" ] || [ "$PURCHASE_ORDERS_COUNT" = "0" ] || [ "$INVENTORY_COUNTS_COUNT" = "0" ] || [ "$DISPOSAL_VOUCHERS_COUNT" = "0" ] || [ "$ADVERTISEMENTS_COUNT" = "0" ]; then
  log "ERROR" "Seed finished but one or more critical tables are empty."
  exit 1
fi

if [ "$JOINABLE_VARIANTS_COUNT" = "0" ] || [ "$ORPHAN_PRODUCT_REFS" != "0" ] || [ "$ORPHAN_UNIT_REFS" != "0" ]; then
  log "ERROR" "Seed finished but variant relations are inconsistent (product/unit joins broken)."
  exit 1
fi

if [ "$STOCKED_VARIANTS_COUNT" = "0" ]; then
  log "ERROR" "Seed finished but inventory_stock has no positive quantities mapped to variants."
  exit 1
fi

log "DONE" "Seed completed"
echo "Database reset + seed completed for: $MYSQL_DATABASE"
echo "Next command:"
echo "  docker compose -f $COMPOSE_FILE up -d --remove-orphans"