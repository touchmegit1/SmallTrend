#!/usr/bin/env bash
# Import all backup SQL files into MySQL with backend stopped.
# Core approach: stop backend -> import SQL -> start backend with DDL=none -> revert to update
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/smalltrend}"
COMPOSE_FILE="${COMPOSE_FILE:-$DEPLOY_PATH/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-$DEPLOY_PATH/deploy/env/backend.env}"
BACKUP_DIR="${BACKUP_DIR:-$DEPLOY_PATH/backup_data_value}"

log() { printf "[%s] %s\n" "$1" "$2"; }

get_env_value() {
  local key="$1"
  sed -n "s/^${key}=//p" "$ENV_FILE" | tail -n 1 | tr -d '\r'
}
MYSQL_DATABASE="$(get_env_value MYSQL_DATABASE)"
MYSQL_ROOT_PASSWORD="$(get_env_value MYSQL_ROOT_PASSWORD)"
: "${MYSQL_DATABASE:=smalltrend}"
: "${MYSQL_ROOT_PASSWORD:=root1234}"

log "1/7" "Stopping backend to prevent JPA schema conflicts..."
docker compose -f "$COMPOSE_FILE" stop backend 2>/dev/null || true
sleep 3

log "2/7" "Dropping all existing tables..."
docker compose -f "$COMPOSE_FILE" exec -T mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
  -e "SET FOREIGN_KEY_CHECKS = 0;" 2>/dev/null || true

TABLES=$(docker compose -f "$COMPOSE_FILE" exec -T mysql mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" \
  -e "SELECT GROUP_CONCAT(table_name) FROM information_schema.tables WHERE table_schema='$MYSQL_DATABASE';" 2>/dev/null | tr -d '\r')

if [ -n "$TABLES" ] && [ "$TABLES" != "NULL" ]; then
  for t in $(echo "$TABLES" | tr ',' ' '); do
    docker compose -f "$COMPOSE_FILE" exec -T mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" \
      -e "DROP TABLE IF EXISTS \`$t\`;" 2>/dev/null || true
  done
  log "2/7" "Dropped $(echo "$TABLES" | tr ',' ' ' | wc -w) tables"
else
  log "2/7" "No tables to drop"
fi

log "3/7" "Importing all SQL files from $BACKUP_DIR..."
IMPORTED=0
for f in "$BACKUP_DIR"/*.sql; do
  [ -f "$f" ] || continue
  log "IMPORT" "$(basename "$f")"
  (echo "SET FOREIGN_KEY_CHECKS=0;"; cat "$f"; echo "SET FOREIGN_KEY_CHECKS=1;") | \
    docker compose -f "$COMPOSE_FILE" exec -T mysql \
    mysql --default-character-set=utf8mb4 --force -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" 2>/dev/null
  IMPORTED=$((IMPORTED + 1))
done
log "3/7" "Imported $IMPORTED files"

log "4/7" "Verifying data in MySQL (before backend starts)..."
PRODUCTS=$(docker compose -f "$COMPOSE_FILE" exec -T mysql mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM products;" 2>/dev/null | tr -d '\r' || echo 0)
VARIANTS=$(docker compose -f "$COMPOSE_FILE" exec -T mysql mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM product_variants;" 2>/dev/null | tr -d '\r' || echo 0)
STOCK=$(docker compose -f "$COMPOSE_FILE" exec -T mysql mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM inventory_stock;" 2>/dev/null | tr -d '\r' || echo 0)
ORDERS=$(docker compose -f "$COMPOSE_FILE" exec -T mysql mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM sale_orders;" 2>/dev/null | tr -d '\r' || echo 0)
echo "  products=$PRODUCTS variants=$VARIANTS stock=$STOCK orders=$ORDERS"

log "5/7" "Setting SPRING_JPA_DDL_AUTO=none to preserve imported data..."
sudo sed -i 's/^SPRING_JPA_DDL_AUTO=.*/SPRING_JPA_DDL_AUTO=none/' "$ENV_FILE"
sudo sed -i 's/^SPRING_SQL_INIT_MODE=.*/SPRING_SQL_INIT_MODE=never/' "$ENV_FILE"

log "6/7" "Starting backend (will NOT modify schema)..."
docker compose -f "$COMPOSE_FILE" up -d backend
sleep 15

log "7/7" "Reverting DDL_AUTO back to update for future deploys..."
sudo sed -i 's/^SPRING_JPA_DDL_AUTO=.*/SPRING_JPA_DDL_AUTO=update/' "$ENV_FILE"
sudo sed -i 's/^SPRING_SQL_INIT_MODE=.*/SPRING_SQL_INIT_MODE=always/' "$ENV_FILE"

log "DONE" "Seed complete! products=$PRODUCTS variants=$VARIANTS stock=$STOCK orders=$ORDERS"
