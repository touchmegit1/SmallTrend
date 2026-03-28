#!/usr/bin/env bash
# Initialize MySQL container and seed SmallTrend data.sql on Azure VM.
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/smalltrend}"
COMPOSE_FILE="$DEPLOY_PATH/docker-compose.prod.yml"
ENV_FILE="$DEPLOY_PATH/deploy/env/backend.env"
SEED_FILE="$DEPLOY_PATH/backend/src/main/resources/data.sql"

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

log "1/7" "Checking required files"
require_file "$COMPOSE_FILE"
require_file "$ENV_FILE"
require_file "$SEED_FILE"

cd "$DEPLOY_PATH"

log "2/7" "Reading required DB variables from backend.env"
get_env_value() {
  local key="$1"
  sed -n "s/^${key}=//p" "$ENV_FILE" | tail -n 1 | tr -d '\r'
}

MYSQL_DATABASE="$(get_env_value MYSQL_DATABASE)"
MYSQL_ROOT_PASSWORD="$(get_env_value MYSQL_ROOT_PASSWORD)"

: "${MYSQL_DATABASE:=smalltrend}"
: "${MYSQL_ROOT_PASSWORD:=root1234}"

log "3/7" "Starting mysql service"
docker compose -f "$COMPOSE_FILE" up -d mysql

log "4/7" "Waiting for mysql health"
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

log "5/7" "Ensuring database exists"
docker compose -f "$COMPOSE_FILE" exec -T mysql sh -lc \
  'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'

log "6/7" "Seeding database from data.sql"
docker compose -f "$COMPOSE_FILE" exec -T mysql sh -lc \
  'mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' < "$SEED_FILE"

log "7/7" "Done"
echo "Seed completed for database: $MYSQL_DATABASE"

echo "Next command (optional):"
echo "  docker compose -f $COMPOSE_FILE up -d --remove-orphans"
