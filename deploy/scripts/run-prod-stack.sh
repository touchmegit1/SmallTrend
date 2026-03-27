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

if [ -z "$IMAGE_NAMESPACE" ]; then
  echo "IMAGE_NAMESPACE is empty."
  echo "Set IMAGE_NAMESPACE in your shell before running, e.g.:"
  echo "  export IMAGE_NAMESPACE=your_dockerhub_username"
  exit 1
fi

if [[ "${DB_URL:-}" != *"mysql:3306"* ]]; then
  echo "Warning: DB_URL does not point to mysql service (mysql:3306)."
  echo "Current DB_URL: ${DB_URL:-<empty>}"
fi

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
DB_USERNAME="$DB_USERNAME" \
DB_PASSWORD="$DB_PASSWORD" \
MYSQL_DATABASE="$MYSQL_DATABASE" \
MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

print_step "7/7" "Current status"
REGISTRY="$REGISTRY" \
IMAGE_NAMESPACE="$IMAGE_NAMESPACE" \
IMAGE_TAG="$IMAGE_TAG" \
DB_USERNAME="$DB_USERNAME" \
DB_PASSWORD="$DB_PASSWORD" \
MYSQL_DATABASE="$MYSQL_DATABASE" \
MYSQL_ROOT_PASSWORD="$MYSQL_ROOT_PASSWORD" \
docker compose -f "$COMPOSE_FILE" ps

echo "\nDone. If backend is still unhealthy, check logs:"
echo "  docker compose -f $COMPOSE_FILE logs --tail=150 mysql backend frontend"
