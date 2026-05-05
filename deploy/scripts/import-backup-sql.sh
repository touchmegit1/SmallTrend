#!/usr/bin/env bash
# Import all backup SQL files into MySQL in correct dependency order.
# Uses FOREIGN_KEY_CHECKS=0 for safe bulk import.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/smalltrend}"
COMPOSE_FILE="${COMPOSE_FILE:-$DEPLOY_PATH/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$DEPLOY_PATH/deploy/env/backend.env}"
BACKUP_DIR="${BACKUP_DIR:-$DEPLOY_PATH/backup_data_value}"
SEED_LOG_DIR="${SEED_LOG_DIR:-$DEPLOY_PATH/deploy/seed-logs}"

log() { printf "[%s] %s\n" "$1" "$2"; }

# ─── Read DB credentials ───
get_env_value() {
  local key="$1"
  sed -n "s/^${key}=//p" "$ENV_FILE" | tail -n 1 | tr -d '\r'
}
MYSQL_DATABASE="$(get_env_value MYSQL_DATABASE)"
MYSQL_ROOT_PASSWORD="$(get_env_value MYSQL_ROOT_PASSWORD)"
: "${MYSQL_DATABASE:=smalltrend}"
: "${MYSQL_ROOT_PASSWORD:=root1234}"

mkdir -p "$SEED_LOG_DIR"
ERR_LOG="$SEED_LOG_DIR/backup_import_errors_$(date +%Y%m%d_%H%M%S).log"

log "1/4" "Checking backup directory: $BACKUP_DIR"
if [ ! -d "$BACKUP_DIR" ]; then
  log "ERROR" "Backup directory not found: $BACKUP_DIR"
  exit 1
fi

# ─── Import order: tables without FKs first, then dependent tables ───
# Ordered to avoid foreign key violations during import
ORDERED_TABLES=(
  # Tier 0: No FK dependencies
  smalltrend_roles
  smalltrend_permissions
  smalltrend_role_permissions
  smalltrend_users
  smalltrend_user_credentials
  smalltrend_password_reset_otp
  smalltrend_units
  smalltrend_categories
  smalltrend_tax_rates
  smalltrend_locations
  smalltrend_suppliers
  smalltrend_customers
  smalltrend_customer_tiers
  smalltrend_coupons
  smalltrend_ai_settings
  smalltrend_reports
  smalltrend_notifications

  # Tier 1: Depends on units, categories, tax_rates, suppliers
  smalltrend_brands
  smalltrend_products
  smalltrend_product_variants
  smalltrend_variant_attributes
  smalltrend_variant_prices
  smalltrend_supplier_contracts

  # Tier 2: Depends on product_variants, locations
  smalltrend_product_batches
  smalltrend_inventory_stock
  smalltrend_stock_movements
  smalltrend_product_combos
  smalltrend_product_combo_items
  smalltrend_unit_conversions

  # Tier 3: Depends on products/variants + customers/users
  smalltrend_sale_orders
  smalltrend_sale_order_items
  smalltrend_sale_order_histories
  smalltrend_coupon_usage
  smalltrend_purchase_orders
  smalltrend_purchase_order_items
  smalltrend_purchase_history
  smalltrend_tickets
  smalltrend_advertisements
  smalltrend_campaigns
  smalltrend_loyalty_gifts
  smalltrend_loyalty_transactions
  smalltrend_gift_redemption_history

  # Tier 4: Cash & Inventory management
  smalltrend_cash_registers
  smalltrend_cash_transactions
  smalltrend_inventory_counts
  smalltrend_inventory_count_items
  smalltrend_disposal_vouchers
  smalltrend_disposal_voucher_items

  # Tier 5: HR / Work shifts
  smalltrend_work_shifts
  smalltrend_work_shift_assignments
  smalltrend_attendance
  smalltrend_salary_configs
  smalltrend_payroll_calculations
  smalltrend_shift_handovers
  smalltrend_shift_swap_requests

  # Tier 6: Logs & alerts
  smalltrend_audit_logs
  smalltrend_price_expiry_alert_logs
)

log "2/4" "Starting MySQL import with FOREIGN_KEY_CHECKS=0"

IMPORTED=0
SKIPPED=0

for table in "${ORDERED_TABLES[@]}"; do
  SQL_FILE="$BACKUP_DIR/${table}.sql"
  if [ ! -f "$SQL_FILE" ]; then
    log "SKIP" "File not found: ${table}.sql"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  log "IMPORT" "${table}.sql ($(wc -c < "$SQL_FILE") bytes)"

  # Import with FK checks disabled, force-ignore duplicate key errors
  {
    echo "SET FOREIGN_KEY_CHECKS = 0;"
    cat "$SQL_FILE"
    echo "COMMIT;"
  } | docker compose -f "$COMPOSE_FILE" exec -T mysql \
      mysql --default-character-set=utf8mb4 --force -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" 2>>"$ERR_LOG" || true

  IMPORTED=$((IMPORTED + 1))
done

# Re-enable FK checks
docker compose -f "$COMPOSE_FILE" exec -T mysql \
  mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
  -e "SET FOREIGN_KEY_CHECKS = 1;" 2>/dev/null || true

log "3/4" "Verifying imported data"

# Quick row counts
declare -A CRITICAL_TABLES=(
  [users]=users
  [roles]=roles
  [products]=products
  [product_variants]=product_variants
  [inventory_stock]=inventory_stock
  [sale_orders]=sale_orders
  [sale_order_items]=sale_order_items
)

for label in "${!CRITICAL_TABLES[@]}"; do
  table="${CRITICAL_TABLES[$label]}"
  count=$(docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
    -e "SELECT COUNT(*) FROM $table;" 2>/dev/null | tr -d '\r' || echo "0")
  echo "  $table = $count rows"
done

log "4/4" "Backup import completed"
echo ""
echo "Imported: $IMPORTED | Skipped: $SKIPPED | Errors in: $ERR_LOG"
