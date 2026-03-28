#!/usr/bin/env bash
# SmallTrend production stack runner for Azure VM
# - Loads DB credentials from deploy/env/backend.env
# - Starts MySQL container first and waits for healthy state
# - Brings up backend + frontend after DB is ready

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$REPO_ROOT/deploy/env/backend.env"
ENV_EXAMPLE="$REPO_ROOT/deploy/env/backend.env.example"
COMPOSE_FILE="$REPO_ROOT/docker-compose.prod.yml"

print_step() {
  printf "\n[%s] %s\n" "$1" "$2"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    echo "Install it first, then run this script again."
    exit 1
  fi
}

print_step "1/7" "Validating prerequisites"
require_cmd docker
if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin is missing. Install docker-compose-plugin first."
  exit 1
fi

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "Cannot find compose file: $COMPOSE_FILE"
  exit 1
fi

print_step "2/7" "Preparing environment file"
if [ ! -f "$ENV_FILE" ]; then
  if [ ! -f "$ENV_EXAMPLE" ]; then
    echo "Cannot find env template: $ENV_EXAMPLE"
    exit 1
  fi

  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created $ENV_FILE from template."
  echo "Please edit DB_PASSWORD, MYSQL_ROOT_PASSWORD, JWT_SECRET before first production run."
fi

set -a
# shellcheck disable=SC1090
. "$ENV_FILE"
set +a

: "${DB_USERNAME:=smalltrend}"
: "${DB_PASSWORD:=1234}"
: "${MYSQL_DATABASE:=smalltrend}"
: "${MYSQL_ROOT_PASSWORD:=root1234}"
: "${REGISTRY:=docker.io}"
: "${IMAGE_NAMESPACE:=}"
: "${IMAGE_TAG:=latest}"
: "${SPRING_SQL_INIT_MODE:=never}"
: "${SPRING_JPA_DDL_AUTO:=update}"

CANONICAL_DB_URL="jdbc:mysql://mysql:3306/${MYSQL_DATABASE}?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true&useUnicode=true&characterEncoding=UTF-8"
EFFECTIVE_DB_URL="$CANONICAL_DB_URL"

if [ -n "${DB_URL:-}" ] && [[ "${DB_URL}" == *"mysql:3306"* ]] && [[ "${DB_URL}" == *"/${MYSQL_DATABASE}"* ]]; then
  EFFECTIVE_DB_URL="$DB_URL"
elif [ -n "${DB_URL:-}" ]; then
  echo "Warning: DB_URL is not container-safe for compose network."
  echo "Current DB_URL: ${DB_URL}"
  echo "Using canonical DB_URL: $CANONICAL_DB_URL"
fi

if [ -z "$IMAGE_NAMESPACE" ]; then
  echo "IMAGE_NAMESPACE is empty."
  echo "Set IMAGE_NAMESPACE in your shell before running, e.g.:"
  echo "  export IMAGE_NAMESPACE=your_dockerhub_username"
  exit 1
fi

echo "Effective DB_URL: $EFFECTIVE_DB_URL"

print_step "3/7" "Logging in to Docker Hub (if credentials are present)"
if [ -n "${DOCKERHUB_USERNAME:-}" ] && [ -n "${DOCKERHUB_TOKEN:-}" ]; then
  echo "$DOCKERHUB_TOKEN" | docker login -u "$DOCKERHUB_USERNAME" --password-stdin
else
  echo "DOCKERHUB_USERNAME/DOCKERHUB_TOKEN not set. Skipping docker login."
fi

print_step "4/7" "Starting MySQL container"
docker compose -f "$COMPOSE_FILE" up -d mysql

print_step "5/7" "Waiting for MySQL health"
MYSQL_CONTAINER_ID="$(docker compose -f "$COMPOSE_FILE" ps -q mysql)"
if [ -z "$MYSQL_CONTAINER_ID" ]; then
  echo "Could not find mysql container ID after startup."
  exit 1
fi

MAX_ATTEMPTS=30
ATTEMPT=1
while [ "$ATTEMPT" -le "$MAX_ATTEMPTS" ]; do
  HEALTH="$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$MYSQL_CONTAINER_ID")"
  if [ "$HEALTH" = "healthy" ]; then
    echo "MySQL is healthy."
    break
  fi
  echo "MySQL health: $HEALTH (attempt $ATTEMPT/$MAX_ATTEMPTS). Waiting 5s..."
  sleep 5
  ATTEMPT=$((ATTEMPT + 1))
done

if [ "$ATTEMPT" -gt "$MAX_ATTEMPTS" ]; then
  echo "MySQL did not become healthy in time."
  docker compose -f "$COMPOSE_FILE" logs --tail=120 mysql || true
  exit 1
fi

print_step "6/7" "Starting full stack"
REGISTRY="$REGISTRY" \
IMAGE_NAMESPACE="$IMAGE_NAMESPACE" \
IMAGE_TAG="$IMAGE_TAG" \
DB_URL="$EFFECTIVE_DB_URL" \
DB_USERNAME="$DB_USERNAME" \
DB_PASSWORD="$DB_PASSWORD" \
MYSQL_DATABASE="$MYSQL_DATABASE" \
MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
SPRING_SQL_INIT_MODE="$SPRING_SQL_INIT_MODE" \
SPRING_JPA_DDL_AUTO="$SPRING_JPA_DDL_AUTO" \
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

print_step "7/7" "Current status"
REGISTRY="$REGISTRY" \
IMAGE_NAMESPACE="$IMAGE_NAMESPACE" \
IMAGE_TAG="$IMAGE_TAG" \
DB_URL="$EFFECTIVE_DB_URL" \
DB_USERNAME="$DB_USERNAME" \
DB_PASSWORD="$DB_PASSWORD" \
MYSQL_DATABASE="$MYSQL_DATABASE" \
MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
SPRING_SQL_INIT_MODE="$SPRING_SQL_INIT_MODE" \
SPRING_JPA_DDL_AUTO="$SPRING_JPA_DDL_AUTO" \
docker compose -f "$COMPOSE_FILE" ps

echo "\nQuick DB integrity diagnostics:"
docker compose -f "$COMPOSE_FILE" exec -T mysql \
  mysql -N -s -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" -e "
    SELECT
      (SELECT COUNT(*) FROM products) AS products_count,
      (SELECT COUNT(*) FROM product_variants) AS variants_count,
      (SELECT COUNT(*) FROM units) AS units_count,
      (SELECT COUNT(*) FROM inventory_stock) AS stock_rows,
      (SELECT COUNT(*)
         FROM product_variants pv
         LEFT JOIN products p ON p.id = pv.product_id
         LEFT JOIN units u ON u.id = pv.unit_id
        WHERE p.id IS NOT NULL AND u.id IS NOT NULL) AS joinable_variants,
      (SELECT COUNT(*)
         FROM product_variants pv
         LEFT JOIN products p ON p.id = pv.product_id
        WHERE p.id IS NULL) AS orphan_product_refs,
      (SELECT COUNT(*)
         FROM product_variants pv
         LEFT JOIN units u ON u.id = pv.unit_id
        WHERE u.id IS NULL) AS orphan_unit_refs,
      (SELECT COUNT(DISTINCT variant_id)
         FROM inventory_stock
        WHERE COALESCE(quantity, 0) > 0) AS stocked_variants;
  " || true

echo "\nDone. If backend is still unhealthy, check logs:"
echo "  docker compose -f $COMPOSE_FILE logs --tail=150 mysql backend frontend"
