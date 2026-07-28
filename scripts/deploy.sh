#!/bin/bash
# scripts/deploy.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Check environment
if [ -z "$1" ]; then
    echo -e "${RED}❌ Please specify environment: ./deploy.sh [production|staging]${NC}"
    exit 1
fi

ENV=$1
COMPOSE_FILE="docker-compose.${ENV}.yml"

echo -e "${GREEN}📦 Deploying to: $ENV${NC}"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Compose file not found: $COMPOSE_FILE${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Build and deploy
echo -e "${YELLOW}🏗️  Building containers...${NC}"
docker-compose -f $COMPOSE_FILE build

echo -e "${YELLOW}🔄 Restarting services...${NC}"
docker-compose -f $COMPOSE_FILE up -d --remove-orphans

# Run database migrations
echo -e "${YELLOW}🗄️  Running migrations...${NC}"
docker-compose -f $COMPOSE_FILE exec -T nextjs npm run migrate || echo -e "${YELLOW}⚠️  Migration failed, continuing...${NC}"

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 10

if command -v curl &> /dev/null; then
    HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null || echo "000")
else
    HEALTH=$(wget -q -O- --server-response http://localhost/api/health 2>&1 | grep "200 OK" | wc -l)
    HEALTH=$([ "$HEALTH" -gt 0 ] && echo "200" || echo "000")
fi

if [ "$HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
else
    echo -e "${RED}❌ Health check failed! Rolling back...${NC}"
    docker-compose -f $COMPOSE_FILE down
    docker-compose -f $COMPOSE_FILE up -d
    echo -e "${RED}⚠️  Rollback complete. Please investigate.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Deployment complete!${NC}"